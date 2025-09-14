from fastapi import APIRouter, UploadFile, Depends, HTTPException, File, status
from sqlalchemy.orm import Session
from db import SessionLocal, User, Attendance, EmotionSession, EmotionRecord
from models.face_recognition import extract_face_embedding, bytes_to_embedding, cosine_similarity
from models.emotion_detection import get_emotion_detector
from config import settings
from datetime import datetime, timedelta
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


@router.post("/")
async def match_face(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        raise HTTPException(status_code=400, detail="Invalid file format")

    try:
        content: bytes = await file.read()

        # Extract embedding from uploaded image
        new_embedding = extract_face_embedding(content)

        # Compare with stored embeddings and pick the best cosine similarity
        users = db.query(User).all()
        if not users:
            raise HTTPException(status_code=404, detail="No registered users to match against")

        best_user = None
        best_score = -1.0
        for user in users:
            stored_embedding = bytes_to_embedding(user.face_embedding)
            score = cosine_similarity(new_embedding, stored_embedding)
            if score > best_score:
                best_score = score
                best_user = user

        if best_user and best_score >= settings.match_threshold:
            # Deduplicate attendance within configured window
            window_start = datetime.utcnow() - timedelta(seconds=settings.attendance_dedup_seconds)
            recent = (
                db.query(Attendance)
                .filter(Attendance.user_id == best_user.id, Attendance.timestamp >= window_start)
                .first()
            )
            if recent is None:
                attendance = Attendance(user_id=best_user.id)
                db.add(attendance)
                db.commit()
                return {"message": "Face matched", "user_id": best_user.id, "score": best_score, "dedup": False}
            else:
                return {"message": "Face matched (deduped)", "user_id": best_user.id, "score": best_score, "dedup": True}

        raise HTTPException(status_code=404, detail=f"No match found (best score={best_score:.3f}, threshold={settings.match_threshold})")
    except HTTPException:
        raise
    except ValueError as ve:
        # Face detection/validation errors -> 400
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception:
        raise HTTPException(status_code=500, detail="Match failed") 


@router.post("/stream")
async def match_stream_frame(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Endpoint for camera agents to send individual JPEG frames.

    Behavior: same as `/match/` but optimized for continuous frames and returns
    a compact payload for lower bandwidth and latency.
    """
    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        raise HTTPException(status_code=400, detail="Invalid file format")

    try:
        content: bytes = await file.read()
        new_embedding = extract_face_embedding(content)

        users = db.query(User).all()
        if not users:
            raise HTTPException(status_code=404, detail="No registered users to match against")

        best_user = None
        best_score = -1.0
        for user in users:
            stored_embedding = bytes_to_embedding(user.face_embedding)
            score = cosine_similarity(new_embedding, stored_embedding)
            if score > best_score:
                best_score = score
                best_user = user

        if best_user and best_score >= settings.match_threshold:
            window_start = datetime.utcnow() - timedelta(seconds=settings.attendance_dedup_seconds)
            recent = (
                db.query(Attendance)
                .filter(Attendance.user_id == best_user.id, Attendance.timestamp >= window_start)
                .first()
            )
            created = False
            if recent is None:
                attendance = Attendance(user_id=best_user.id)
                db.add(attendance)
                db.commit()
                created = True
            return {"user_id": best_user.id, "score": best_score, "created": created}

        return {"user_id": None, "score": best_score}
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception:
        raise HTTPException(status_code=500, detail="Stream match failed")


@router.post("/with-emotion")
async def match_face_with_emotion(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Enhanced face matching with emotion detection and eye tracking"""
    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        raise HTTPException(status_code=400, detail="Invalid file format")

    try:
        content: bytes = await file.read()

        # First, do face recognition
        new_embedding = extract_face_embedding(content)
        users = db.query(User).all()
        
        if not users:
            raise HTTPException(status_code=404, detail="No registered users to match against")

        best_user = None
        best_score = -1.0
        for user in users:
            stored_embedding = bytes_to_embedding(user.face_embedding)
            score = cosine_similarity(new_embedding, stored_embedding)
            if score > best_score:
                best_score = score
                best_user = user

        # Get emotion detection results
        detector = get_emotion_detector()
        emotion_result = detector.process_frame(content)
        
        result = {
            "face_recognition": {
                "user_id": best_user.id if best_user and best_score >= settings.match_threshold else None,
                "user_name": best_user.name if best_user and best_score >= settings.match_threshold else None,
                "score": best_score,
                "threshold_met": best_score >= settings.match_threshold if best_user else False
            },
            "emotion_detection": emotion_result,
            "timestamp": datetime.utcnow().isoformat()
        }

        # If face is recognized and emotion detection successful, create attendance
        if best_user and best_score >= settings.match_threshold:
            window_start = datetime.utcnow() - timedelta(seconds=settings.attendance_dedup_seconds)
            recent = (
                db.query(Attendance)
                .filter(Attendance.user_id == best_user.id, Attendance.timestamp >= window_start)
                .first()
            )
            
            created = False
            if recent is None:
                attendance = Attendance(user_id=best_user.id)
                db.add(attendance)
                db.commit()
                created = True
            
            result["face_recognition"]["attendance_created"] = created
            
            # Store emotion data if successful
            if emotion_result.get('success'):
                # Get or create emotion session for this user
                active_session = db.query(EmotionSession).filter(
                    EmotionSession.user_id == best_user.id,
                    EmotionSession.session_end.is_(None)
                ).first()
                
                if not active_session:
                    active_session = EmotionSession(user_id=best_user.id)
                    db.add(active_session)
                    db.commit()
                    db.refresh(active_session)
                
                # Store emotion record
                emotion_data = emotion_result.get('emotion', {})
                gaze_data = emotion_result.get('gaze', {})
                face_bbox = emotion_result.get('face_bbox', {})
                
                emotion_record = EmotionRecord(
                    session_id=active_session.id,
                    dominant_emotion=emotion_data.get('dominant_emotion', 'neutral'),
                    emotion_confidence=emotion_data.get('confidence', 0.0),
                    is_looking_at_camera=gaze_data.get('is_looking_at_camera', False),
                    eye_contact_confidence=gaze_data.get('confidence', 0.0),
                    face_bbox_x=face_bbox.get('x'),
                    face_bbox_y=face_bbox.get('y'),
                    face_bbox_width=face_bbox.get('width'),
                    face_bbox_height=face_bbox.get('height')
                )
                
                db.add(emotion_record)
                db.commit()
                
                result["emotion_session_id"] = active_session.id

        return result

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Enhanced face matching failed: {e}")
        raise HTTPException(status_code=500, detail="Enhanced face matching failed")