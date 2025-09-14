from sqlalchemy import create_engine, Column, Integer, String, LargeBinary, DateTime, ForeignKey, Float, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from config import settings

# Add SQLite-specific connect args
engine_kwargs = {"connect_args": {"check_same_thread": False}} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# User Table
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    face_image_url = Column(String, nullable=False)
    face_embedding = Column(LargeBinary, nullable=False)

# Attendance Table
class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Emotion Detection Session Table
class EmotionSession(Base):
    __tablename__ = "emotion_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_start = Column(DateTime, default=datetime.utcnow)
    session_end = Column(DateTime, nullable=True)
    total_attention_duration = Column(Float, default=0.0)  # in seconds
    total_session_duration = Column(Float, default=0.0)   # in seconds
    attention_percentage = Column(Float, default=0.0)

# Individual Emotion Records
class EmotionRecord(Base):
    __tablename__ = "emotion_records"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("emotion_sessions.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    dominant_emotion = Column(String, nullable=False)  # happy, sad, angry, fear, surprise, disgust, neutral
    emotion_confidence = Column(Float, nullable=False)
    is_looking_at_camera = Column(Boolean, default=False)
    eye_contact_confidence = Column(Float, default=0.0)
    face_bbox_x = Column(Float, nullable=True)  # Bounding box coordinates
    face_bbox_y = Column(Float, nullable=True)
    face_bbox_width = Column(Float, nullable=True)
    face_bbox_height = Column(Float, nullable=True)

# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)