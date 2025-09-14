# Emotion Detection & Eye Contact Tracking Feature

## Overview

This feature adds real-time emotion detection and continuous eye contact tracking to the PresenSense system. It evaluates the user's mood and attention level every 5 seconds during live verification sessions.

## Features

### 🎭 Emotion Detection
- **Real-time emotion analysis** using DeepFace library
- **7 emotion categories**: Happy, Sad, Angry, Fear, Surprise, Disgust, Neutral
- **Confidence scoring** for each detected emotion
- **5-second analysis intervals** for continuous monitoring

### 👁️ Eye Contact Tracking
- **MediaPipe-based gaze detection** without requiring dlib or cmake
- **Real-time eye contact monitoring** using facial landmarks
- **Eye Aspect Ratio (EAR)** calculation to detect blinks and eye state
- **Iris position tracking** for gaze direction analysis

### 📊 Attention Analytics
- **Session-based tracking** with start/end timestamps
- **Attention duration calculation** (time spent looking at camera)
- **Attention percentage** metrics for engagement analysis
- **Database storage** of all emotion and attention data

### 🎨 Visual Feedback
- **Green bounding box** when user is looking at camera (good attention)
- **Orange bounding box** when user is not focused
- **Real-time emotion display** with confidence percentages
- **Live statistics panel** showing session metrics

## Technical Architecture

### Backend Components

#### Database Schema
```python
# Emotion Detection Session
class EmotionSession(Base):
    __tablename__ = "emotion_sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_start = Column(DateTime)
    session_end = Column(DateTime)
    total_attention_duration = Column(Float)  # seconds
    total_session_duration = Column(Float)    # seconds
    attention_percentage = Column(Float)

# Individual Emotion Records
class EmotionRecord(Base):
    __tablename__ = "emotion_records"
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("emotion_sessions.id"))
    timestamp = Column(DateTime)
    dominant_emotion = Column(String)         # emotion category
    emotion_confidence = Column(Float)        # 0.0 - 1.0
    is_looking_at_camera = Column(Boolean)    # eye contact status
    eye_contact_confidence = Column(Float)    # gaze confidence
    face_bbox_x/y/width/height = Column(Float) # face position
```

#### API Endpoints
- `POST /emotion/start-session` - Start emotion tracking session
- `POST /emotion/analyze-frame` - Analyze single frame for emotion/gaze
- `POST /emotion/end-session/{session_id}` - End session and calculate stats
- `GET /emotion/session/{session_id}/stats` - Get real-time session statistics
- `GET /emotion/sessions` - List all emotion sessions

#### Core Models
- **`models/emotion_detection.py`** - Emotion and gaze analysis logic
- **`routes/emotion.py`** - REST API endpoints for emotion tracking

### Frontend Components

#### React Components
- **`EmotionDetection.jsx`** - Main emotion detection interface
- **`EmotionPage.jsx`** - Full-page wrapper with navigation

#### Key Features
- **Live video feed** with camera controls (start/stop/switch)
- **Canvas-based overlay** for face bounding boxes and emotion info
- **Real-time statistics** showing attention metrics
- **User selection** dropdown for multi-user support
- **Responsive design** for mobile and desktop

## Installation & Setup

### 1. Backend Dependencies
Add to `requirements.txt`:
```
mediapipe==0.10.18
```

Install dependencies:
```bash
cd server
pip install -r requirements.txt
```

### 2. Database Migration
The new tables will be created automatically when the server starts. No manual migration needed.

### 3. Frontend Routes
The emotion detection page is available at `/emotion` in the React app.

## Usage Guide

### For Users
1. Navigate to `/emotion` in the web interface
2. Select your User ID from the dropdown
3. Click "Start Camera" to begin video capture
4. Click "Start Emotion Detection" to begin monitoring
5. Look at the camera for eye contact tracking
6. Monitor real-time emotion and attention feedback
7. Click "Stop Detection" to end the session

### Visual Indicators
- **Green box + "Looking at camera"**: Good attention/eye contact
- **Orange box + "Not focused"**: Poor attention/looking away
- **Emotion display**: Current dominant emotion with confidence
- **Statistics panel**: Session duration and attention metrics

## API Usage Examples

### Start Session
```javascript
const response = await fetch('/emotion/start-session?user_id=1', {
    method: 'POST'
});
const data = await response.json();
// Returns: { success: true, session_id: 123 }
```

### Analyze Frame
```javascript
const formData = new FormData();
formData.append('file', imageBlob, 'frame.jpg');

const response = await fetch('/emotion/analyze-frame?session_id=123', {
    method: 'POST',
    body: formData
});
const result = await response.json();
// Returns emotion, gaze, and face detection data
```

### Get Session Stats
```javascript
const response = await fetch('/emotion/session/123/stats');
const stats = await response.json();
// Returns attention metrics and emotion distribution
```

## Technical Details

### Emotion Detection Algorithm
1. **Frame capture** from webcam every 5 seconds
2. **Face detection** using OpenCV Haar Cascades
3. **Emotion analysis** via DeepFace with Facenet model
4. **Results processing** and confidence scoring

### Eye Contact Tracking Algorithm
1. **Face mesh detection** using MediaPipe Face Mesh
2. **Eye landmark extraction** (left/right eye points)
3. **Eye Aspect Ratio calculation** to detect open/closed eyes
4. **Iris position analysis** relative to eye center
5. **Gaze direction classification** (center/left/right/away)

### Performance Considerations
- **5-second intervals** balance accuracy with performance
- **Single face detection** prevents confusion with multiple faces
- **Efficient canvas rendering** for smooth video overlay
- **Background processing** doesn't block UI interactions

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 14+
- ✅ Edge 80+

### Required Permissions
- **Camera access** for video capture
- **Microphone** (muted, but some browsers require permission)

## Security & Privacy

### Data Handling
- **No video storage** - only processed frame-by-frame
- **Emotion data** stored in database with timestamps
- **No facial images** stored permanently
- **Session-based tracking** with clear start/end boundaries

### Privacy Controls
- **Explicit user consent** required for camera access
- **Clear session management** with start/stop controls
- **Local processing** for face detection (no cloud APIs)

## Troubleshooting

### Common Issues

#### "No face detected" Error
- Ensure good lighting conditions
- Position face clearly in camera view
- Check camera permissions in browser

#### "Multiple faces detected" Error
- Ensure only one person is in the camera view
- Adjust camera angle to avoid reflections

#### Poor Eye Contact Detection
- Look directly at the camera lens
- Ensure eyes are clearly visible (no sunglasses)
- Adjust lighting to avoid shadows on face

#### Low Emotion Confidence
- Maintain clear facial expressions
- Ensure face is well-lit and unobstructed
- Allow some time for the model to adjust

### Browser Console Debugging
Enable browser developer tools to see detailed error messages:
```javascript
// Check for camera permissions
navigator.mediaDevices.getUserMedia({video: true})
    .then(stream => console.log('Camera access granted'))
    .catch(err => console.error('Camera error:', err));
```

## Performance Metrics

### Target Performance
- **Analysis interval**: 5 seconds
- **Face detection**: <100ms per frame
- **Emotion analysis**: <500ms per frame
- **Eye tracking**: <200ms per frame
- **Total processing**: <1 second per cycle

### System Requirements
- **Minimum**: 4GB RAM, modern web browser
- **Recommended**: 8GB RAM, dedicated graphics card
- **Camera**: 720p resolution minimum, 1080p recommended

## Future Enhancements

### Planned Features
- **WebRTC integration** for lower latency
- **Advanced gaze tracking** with pupil detection
- **Emotion trend analysis** over longer periods
- **Multi-user session support** with face recognition
- **Mobile app version** with native camera APIs

### API Extensions
- **WebSocket endpoints** for real-time streaming
- **Batch analysis** for recorded video files
- **Export functionality** for session data
- **Advanced analytics** with emotion patterns

## Development Notes

### Libraries Used
- **DeepFace**: Emotion analysis and face recognition
- **MediaPipe**: Face mesh and landmark detection
- **OpenCV**: Basic image processing and face detection
- **React**: Frontend user interface
- **FastAPI**: Backend REST API
- **SQLAlchemy**: Database ORM

### Key Design Decisions
- **Hybrid approach**: OpenCV + MediaPipe for robust detection
- **No dlib dependency**: Avoids complex cmake installation
- **Session-based**: Clear data organization and privacy boundaries
- **Real-time feedback**: Immediate visual confirmation for users
- **Polling-based**: Simple implementation vs WebSocket complexity