from fastapi import APIRouter, UploadFile, Depends, HTTPException, File, status
from sqlalchemy.orm import Session
from db import SessionLocal, User, EmotionSession, EmotionRecord
from models.emotion_detection import get_emotion_detector
from config import settings
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency for DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/start-session")
async def start_emotion_session(user_id: int, db: Session = Depends(get_db)):
    """Start a new emotion detection session for a user"""
    try:
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if there's already an active session for this user
        active_session = db.query(EmotionSession).filter(
            EmotionSession.user_id == user_id,
            EmotionSession.session_end.is_(None)
        ).first()
        
        if active_session:
            return {
                "success": True,
                "session_id": active_session.id,
                "message": "Using existing active session",
                "session_start": active_session.session_start
            }
        
        # Create new session
        new_session = EmotionSession(user_id=user_id)
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        return {
            "success": True,
            "session_id": new_session.id,
            "message": "New emotion session started",
            "session_start": new_session.session_start
        }
        
    except Exception as e:
        logger.error(f"Failed to start emotion session: {e}")
        raise HTTPException(status_code=500, detail="Failed to start emotion session")

@router.post("/end-session/{session_id}")
async def end_emotion_session(session_id: int, db: Session = Depends(get_db)):
    """End an emotion detection session and calculate final statistics"""
    try:
        # Get the session
        session = db.query(EmotionSession).filter(EmotionSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if session.session_end is not None:
            raise HTTPException(status_code=400, detail="Session already ended")
        
        # End the session
        session.session_end = datetime.utcnow()
        
        # Calculate session statistics
        session_duration = (session.session_end - session.session_start).total_seconds()
        session.total_session_duration = session_duration
        
        # Get all emotion records for this session
        emotion_records = db.query(EmotionRecord).filter(
            EmotionRecord.session_id == session_id
        ).all()
        
        # Calculate attention duration (time when user was looking at camera)
        attention_duration = 0.0
        for record in emotion_records:
            if record.is_looking_at_camera:
                attention_duration += 5.0  # Each record represents ~5 seconds
        
        session.total_attention_duration = attention_duration
        session.attention_percentage = (attention_duration / session_duration * 100) if session_duration > 0 else 0.0
        
        db.commit()
        
        return {
            "success": True,
            "session_id": session_id,
            "total_duration": session_duration,
            "attention_duration": attention_duration,
            "attention_percentage": session.attention_percentage,
            "total_emotion_records": len(emotion_records)
        }
        
    except Exception as e:
        logger.error(f"Failed to end emotion session: {e}")
        raise HTTPException(status_code=500, detail="Failed to end emotion session")

@router.post("/analyze-frame")
async def analyze_emotion_frame(
    session_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Analyze a single frame for emotion and eye contact"""
    try:
        # Validate file format
        if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
            raise HTTPException(status_code=400, detail="Invalid file format")
        
        # Check if session exists and is active
        session = db.query(EmotionSession).filter(EmotionSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if session.session_end is not None:
            raise HTTPException(status_code=400, detail="Session has ended")
        
        # Read file content
        content: bytes = await file.read()
        
        # Process frame with emotion detector
        detector = get_emotion_detector()
        analysis_result = detector.process_frame(content)
        
        if not analysis_result['success']:
            return {
                "success": False,
                "error": analysis_result['error'],
                "session_id": session_id
            }
        
        # Extract results
        face_bbox = analysis_result['face_bbox']
        emotion_data = analysis_result['emotion']
        gaze_data = analysis_result['gaze']
        
        # Create emotion record
        emotion_record = EmotionRecord(
            session_id=session_id,
            dominant_emotion=emotion_data['dominant_emotion'],
            emotion_confidence=emotion_data['confidence'],
            is_looking_at_camera=gaze_data['is_looking_at_camera'],
            eye_contact_confidence=gaze_data['confidence'],
            face_bbox_x=face_bbox['x'],
            face_bbox_y=face_bbox['y'],
            face_bbox_width=face_bbox['width'],
            face_bbox_height=face_bbox['height']
        )
        
        db.add(emotion_record)
        db.commit()
        db.refresh(emotion_record)
        
        # Return analysis results
        return {
            "success": True,
            "session_id": session_id,
            "record_id": emotion_record.id,
            "analysis": {
                "face_bbox": face_bbox,
                "emotion": emotion_data,
                "gaze": gaze_data,
                "timestamp": emotion_record.timestamp.isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Frame analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Frame analysis failed")

@router.get("/session/{session_id}/stats")
async def get_session_stats(session_id: int, db: Session = Depends(get_db)):
    """Get real-time statistics for an active session"""
    try:
        session = db.query(EmotionSession).filter(EmotionSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get emotion records
        emotion_records = db.query(EmotionRecord).filter(
            EmotionRecord.session_id == session_id
        ).order_by(EmotionRecord.timestamp.desc()).all()
        
        # Calculate current session duration
        current_time = datetime.utcnow()
        session_duration = (current_time - session.session_start).total_seconds()
        
        # Calculate attention metrics
        attention_records = [r for r in emotion_records if r.is_looking_at_camera]
        attention_duration = len(attention_records) * 5.0  # Each record ~5 seconds
        attention_percentage = (attention_duration / session_duration * 100) if session_duration > 0 else 0.0
        
        # Emotion distribution
        emotion_counts = {}
        for record in emotion_records:
            emotion = record.dominant_emotion
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        # Recent activity (last 10 records)
        recent_records = emotion_records[:10]
        recent_activity = [
            {
                "timestamp": r.timestamp.isoformat(),
                "emotion": r.dominant_emotion,
                "looking_at_camera": r.is_looking_at_camera,
                "confidence": r.emotion_confidence
            }
            for r in recent_records
        ]
        
        return {
            "success": True,
            "session_id": session_id,
            "session_active": session.session_end is None,
            "session_duration": session_duration,
            "attention_duration": attention_duration,
            "attention_percentage": attention_percentage,
            "total_records": len(emotion_records),
            "emotion_distribution": emotion_counts,
            "recent_activity": recent_activity
        }
        
    except Exception as e:
        logger.error(f"Failed to get session stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get session stats")

@router.get("/sessions")
async def get_user_sessions(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get emotion sessions for a user or all sessions"""
    try:
        query = db.query(EmotionSession)
        if user_id:
            query = query.filter(EmotionSession.user_id == user_id)
        
        sessions = query.order_by(EmotionSession.session_start.desc()).limit(50).all()
        
        session_data = []
        for session in sessions:
            # Get user name
            user = db.query(User).filter(User.id == session.user_id).first()
            user_name = user.name if user else "Unknown"
            
            session_data.append({
                "session_id": session.id,
                "user_id": session.user_id,
                "user_name": user_name,
                "session_start": session.session_start.isoformat(),
                "session_end": session.session_end.isoformat() if session.session_end else None,
                "duration": session.total_session_duration,
                "attention_duration": session.total_attention_duration,
                "attention_percentage": session.attention_percentage,
                "is_active": session.session_end is None
            })
        
        return {
            "success": True,
            "sessions": session_data
        }
        
    except Exception as e:
        logger.error(f"Failed to get sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get sessions")