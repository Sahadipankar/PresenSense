import cv2
import numpy as np
from deepface import DeepFace
import tempfile
import os
from typing import Tuple, Dict, Any, Optional
import mediapipe as mp
import logging

logger = logging.getLogger(__name__)

class EmotionDetector:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Initialize MediaPipe Face Mesh for eye tracking
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Eye landmarks indices from MediaPipe Face Mesh
        self.left_eye_landmarks = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
        self.right_eye_landmarks = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        
        # Iris landmarks (for gaze direction)
        self.left_iris = [474, 475, 476, 477]
        self.right_iris = [469, 470, 471, 472]

    def detect_faces_opencv(self, image: np.ndarray) -> list:
        """Detect faces using OpenCV Haar Cascades"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=5, 
            minSize=(30, 30)
        )
        return faces

    def analyze_emotion_deepface(self, image_bytes: bytes) -> Dict[str, Any]:
        """Analyze emotion using DeepFace"""
        fd, path = tempfile.mkstemp(suffix=".jpg")
        try:
            with os.fdopen(fd, "wb") as f:
                f.write(image_bytes)
            
            # Analyze emotions with less strict detection
            analysis = DeepFace.analyze(
                img_path=path,
                actions=['emotion'],
                enforce_detection=False,  # Allow analysis even with low confidence face detection
                silent=True
            )
            
            if isinstance(analysis, list):
                analysis = analysis[0]
            
            emotions = analysis.get('emotion', {})
            dominant_emotion = analysis.get('dominant_emotion', 'neutral')
            
            # Ensure confidence is properly calculated
            confidence = 0.0
            if emotions and dominant_emotion in emotions:
                confidence = emotions[dominant_emotion] / 100.0  # Convert percentage to decimal
            
            return {
                'emotions': emotions,
                'dominant_emotion': dominant_emotion,
                'confidence': confidence
            }
        except Exception as e:
            logger.warning(f"DeepFace emotion analysis failed: {e}")
            return {
                'emotions': {'neutral': 100.0},
                'dominant_emotion': 'neutral',
                'confidence': 0.0
            }
        finally:
            try:
                os.remove(path)
            except Exception:
                pass

    def calculate_eye_aspect_ratio(self, eye_landmarks: list, landmarks) -> float:
        """Calculate Eye Aspect Ratio (EAR) to detect blinks and eye state"""
        try:
            # Get eye landmark points
            points = []
            for idx in eye_landmarks[:6]:  # Use first 6 points for basic EAR calculation
                point = landmarks.landmark[idx]
                points.append([point.x, point.y])
            
            points = np.array(points)
            
            # Calculate distances
            A = np.linalg.norm(points[1] - points[5])  # Vertical distance 1
            B = np.linalg.norm(points[2] - points[4])  # Vertical distance 2
            C = np.linalg.norm(points[0] - points[3])  # Horizontal distance
            
            # EAR formula
            ear = (A + B) / (2.0 * C)
            return ear
        except Exception:
            return 0.0

    def detect_gaze_direction(self, image: np.ndarray) -> Dict[str, Any]:
        """Detect gaze direction using MediaPipe Face Mesh"""
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_image)
            
            if not results.multi_face_landmarks:
                return {
                    'is_looking_at_camera': False,
                    'confidence': 0.0,
                    'left_ear': 0.0,
                    'right_ear': 0.0,
                    'gaze_direction': 'unknown'
                }
            
            face_landmarks = results.multi_face_landmarks[0]
            h, w = image.shape[:2]
            
            # Calculate EAR for both eyes
            left_ear = self.calculate_eye_aspect_ratio(self.left_eye_landmarks, face_landmarks)
            right_ear = self.calculate_eye_aspect_ratio(self.right_eye_landmarks, face_landmarks)
            
            # Average EAR
            avg_ear = (left_ear + right_ear) / 2.0
            
            # Determine if looking at camera based on iris position relative to eye center
            looking_at_camera = False
            gaze_confidence = 0.0
            gaze_direction = 'away'
            
            try:
                # Get iris centers
                left_iris_center = np.mean([
                    [face_landmarks.landmark[i].x * w, face_landmarks.landmark[i].y * h] 
                    for i in self.left_iris
                ], axis=0)
                
                right_iris_center = np.mean([
                    [face_landmarks.landmark[i].x * w, face_landmarks.landmark[i].y * h] 
                    for i in self.right_iris
                ], axis=0)
                
                # Get eye centers (approximate)
                left_eye_center = np.mean([
                    [face_landmarks.landmark[i].x * w, face_landmarks.landmark[i].y * h] 
                    for i in self.left_eye_landmarks[:4]
                ], axis=0)
                
                right_eye_center = np.mean([
                    [face_landmarks.landmark[i].x * w, face_landmarks.landmark[i].y * h] 
                    for i in self.right_eye_landmarks[:4]
                ], axis=0)
                
                # Calculate iris displacement from eye center
                left_displacement = np.linalg.norm(left_iris_center - left_eye_center)
                right_displacement = np.linalg.norm(right_iris_center - right_eye_center)
                
                # Threshold for "looking at camera" (lower displacement means more centered)
                displacement_threshold = 8.0  # pixels
                avg_displacement = (left_displacement + right_displacement) / 2.0
                
                if avg_displacement < displacement_threshold and avg_ear > 0.2:  # Eyes open and centered
                    looking_at_camera = True
                    gaze_confidence = max(0.0, 1.0 - (avg_displacement / displacement_threshold))
                    gaze_direction = 'center'
                else:
                    gaze_confidence = min(1.0, avg_displacement / displacement_threshold)
                    if left_iris_center[0] < left_eye_center[0]:  # Looking left
                        gaze_direction = 'left'
                    elif left_iris_center[0] > left_eye_center[0]:  # Looking right
                        gaze_direction = 'right'
                
            except Exception as e:
                logger.warning(f"Gaze direction calculation failed: {e}")
            
            return {
                'is_looking_at_camera': looking_at_camera,
                'confidence': gaze_confidence,
                'left_ear': left_ear,
                'right_ear': right_ear,
                'gaze_direction': gaze_direction
            }
            
        except Exception as e:
            logger.error(f"Gaze detection failed: {e}")
            return {
                'is_looking_at_camera': False,
                'confidence': 0.0,
                'left_ear': 0.0,
                'right_ear': 0.0,
                'gaze_direction': 'unknown'
            }

    def process_frame(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Process a single frame for emotion detection and eye tracking
        Returns combined results with face bounding box, emotion, and gaze data
        """
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("Could not decode image")
            
            # Detect faces
            faces = self.detect_faces_opencv(image)
            
            if len(faces) == 0:
                return {
                    'success': False,
                    'error': 'No face detected',
                    'face_count': 0
                }
            
            if len(faces) > 1:
                return {
                    'success': False,
                    'error': 'Multiple faces detected',
                    'face_count': len(faces)
                }
            
            # Get the single detected face
            x, y, w, h = faces[0]
            
            # Analyze emotion
            emotion_result = self.analyze_emotion_deepface(image_bytes)
            
            # Analyze gaze
            gaze_result = self.detect_gaze_direction(image)
            
            return {
                'success': True,
                'face_bbox': {
                    'x': int(x),
                    'y': int(y),
                    'width': int(w),
                    'height': int(h)
                },
                'emotion': {
                    'dominant_emotion': emotion_result['dominant_emotion'],
                    'confidence': emotion_result['confidence'],
                    'all_emotions': emotion_result['emotions']
                },
                'gaze': gaze_result,
                'timestamp': np.datetime64('now').astype(str)
            }
            
        except Exception as e:
            logger.error(f"Frame processing failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'face_count': 0
            }

# Global emotion detector instance
_emotion_detector = None

def get_emotion_detector() -> EmotionDetector:
    """Get singleton emotion detector instance"""
    global _emotion_detector
    if _emotion_detector is None:
        _emotion_detector = EmotionDetector()
    return _emotion_detector

def preload_emotion_models():
    """Preload emotion detection models"""
    try:
        detector = get_emotion_detector()
        logger.info("Emotion detection models preloaded successfully")
    except Exception as e:
        logger.warning(f"Failed to preload emotion detection models: {e}")