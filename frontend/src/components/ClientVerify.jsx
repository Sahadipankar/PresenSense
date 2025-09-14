import React, { useEffect, useRef, useState } from 'react'
import { API_ENDPOINTS } from '../config.js'

export default function ClientVerify() {
    const [msg, setMsg] = useState('')
    const [ok, setOk] = useState(false)
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const overlayCanvasRef = useRef(null)
    const [streaming, setStreaming] = useState(false)
    const timerRef = useRef(null)
    const [live, setLive] = useState(false)
    const [facing, setFacing] = useState('user') // 'user' | 'environment'
    const [fullscreen, setFullscreen] = useState(false)
    const containerRef = useRef(null)

    // Emotion detection state
    const [emotionActive, setEmotionActive] = useState(false)
    const [currentEmotion, setCurrentEmotion] = useState(null)
    const [isLookingAtCamera, setIsLookingAtCamera] = useState(false)
    const [faceBbox, setFaceBbox] = useState(null)
    const [attentionStats, setAttentionStats] = useState({
        totalFrames: 0,
        attentionFrames: 0,
        attentionPercentage: 0
    })

    const startWithFacing = async (targetFacing) => {
        try {
            const current = videoRef.current && videoRef.current.srcObject
            if (current && current.getTracks) current.getTracks().forEach(t => t.stop())
            let stream = null
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: targetFacing } } })
            } catch (_) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: targetFacing } } })
                } catch (__) {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true })
                }
            }
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setStreaming(true)
            }
            setFacing(targetFacing)
            setMsg('Camera started'); setOk(true)
        } catch (e) {
            setMsg('Failed to start camera: ' + e); setOk(false)
        }
    }


    // Fullscreen helpers
    const enterFullscreen = () => {
        const el = containerRef.current
        if (el && el.requestFullscreen) {
            el.requestFullscreen()
        } else if (el && el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen()
        } else if (el && el.msRequestFullscreen) {
            el.msRequestFullscreen()
        }
    }
    const exitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen()
        }
    }

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFs = () => {
            setFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement))
        }
        document.addEventListener('fullscreenchange', handleFs)
        document.addEventListener('webkitfullscreenchange', handleFs)
        document.addEventListener('msfullscreenchange', handleFs)
        return () => {
            document.removeEventListener('fullscreenchange', handleFs)
            document.removeEventListener('webkitfullscreenchange', handleFs)
            document.removeEventListener('msfullscreenchange', handleFs)
        }
    }, [])

    // Camera toggle
    const [cameraOn, setCameraOn] = useState(false)
    const start = async (opts = {}) => {
        await startWithFacing(facing)
        setCameraOn(true)
        if (opts.fullscreen) enterFullscreen()
    }
    const stopCamera = () => {
        const v = videoRef.current
        const s = v && v.srcObject
        if (s && s.getTracks) s.getTracks().forEach(t => t.stop())
        setStreaming(false)
        setCameraOn(false)
        setMsg('Camera stopped'); setOk(false)
    }

    const switchCamera = async () => {
        const next = facing === 'user' ? 'environment' : 'user'
        setMsg('Switching camera...')
        try { await startWithFacing(next) } catch { }
    }

    // Emotion detection helper functions
    const drawEmotionOverlay = (ctx, analysis, canvasWidth, canvasHeight) => {
        if (!analysis?.face_bbox) return

        const { face_bbox, emotion, gaze } = analysis

        // Calculate mirrored coordinates for display
        const mirroredX = canvasWidth - (face_bbox.x + face_bbox.width)

        // Draw face bounding box
        ctx.save()
        ctx.scale(-1, 1)
        ctx.strokeStyle = gaze.is_looking_at_camera ? '#00ff00' : '#ff6600'
        ctx.lineWidth = 3
        // Since canvas is mirrored, draw at negative X
        ctx.strokeRect(-mirroredX - face_bbox.width, face_bbox.y, face_bbox.width, face_bbox.height)

        // Draw emotion and attention info (mirrored)
        ctx.fillStyle = gaze.is_looking_at_camera ? '#00ff00' : '#ff6600'
        ctx.font = '16px Arial'
        ctx.textAlign = 'left'
        ctx.fillText(
            `${emotion.dominant_emotion} (${(emotion.confidence * 100).toFixed(1)}%)`,
            -mirroredX - face_bbox.width,
            face_bbox.y - 10
        )

        // Draw attention status
        ctx.fillText(
            gaze.is_looking_at_camera ? '👁 Looking at camera' : '👁 Not focused',
            -mirroredX - face_bbox.width,
            face_bbox.y + face_bbox.height + 20
        )
        ctx.restore()
    }

    const updateAttentionStats = (isLooking) => {
        setAttentionStats(prev => {
            const newTotalFrames = prev.totalFrames + 1
            const newAttentionFrames = prev.attentionFrames + (isLooking ? 1 : 0)
            return {
                totalFrames: newTotalFrames,
                attentionFrames: newAttentionFrames,
                attentionPercentage: (newAttentionFrames / newTotalFrames) * 100
            }
        })
    }

    const verify = async () => {
        if (!streaming) {
            await start({ fullscreen: true })
        } else if (!fullscreen) {
            enterFullscreen()
        }
        const video = videoRef.current
        const canvas = canvasRef.current
        const overlayCanvas = overlayCanvasRef.current

        // Sync canvas size to actual video stream dimensions for best quality
        if (video.videoWidth && video.videoHeight) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            if (overlayCanvas) {
                overlayCanvas.width = video.videoWidth
                overlayCanvas.height = video.videoHeight
            }
        }

        const ctx = canvas.getContext('2d')
        const overlayCtx = overlayCanvas ? overlayCanvas.getContext('2d') : null

        // Clear overlay
        if (overlayCtx) {
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
        }

        // Always apply mirror effect
        ctx.save()
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ctx.restore()

        canvas.toBlob(async (blob) => {
            const fd = new FormData()
            fd.append('file', blob, 'verify.jpg')
            setMsg('Verifying with emotion detection...'); setOk(false)

            try {
                const res = await fetch(API_ENDPOINTS.MATCH_WITH_EMOTION, { method: 'POST', body: fd })
                const data = await res.json()

                if (!res.ok) throw new Error(data.detail || 'Verification failed')

                const faceRecognition = data.face_recognition
                const emotionDetection = data.emotion_detection

                if (faceRecognition.threshold_met) {
                    setMsg(`Attendance marked! Welcome, User ${faceRecognition.user_id}`)
                    setOk(true)

                    // Display emotion overlay if successful
                    if (emotionDetection.success && overlayCtx) {
                        drawEmotionOverlay(overlayCtx, emotionDetection, canvas.width, canvas.height)
                        setCurrentEmotion(emotionDetection.emotion)
                        setIsLookingAtCamera(emotionDetection.gaze.is_looking_at_camera)
                        setFaceBbox(emotionDetection.face_bbox)
                    }
                } else {
                    const sc = typeof faceRecognition.score === 'number' ?
                        ` (Confidence: ${(faceRecognition.score * 100).toFixed(1)}%)` : ''
                    setMsg(`No face match found${sc}`)
                    setOk(false)
                }
            } catch (err) {
                setMsg(String(err))
                setOk(false)
            }
        }, 'image/jpeg')
    }

    const startLive = async () => {
        if (!streaming) { await start({ fullscreen: true }) }
        else if (!fullscreen) { enterFullscreen() }
        if (timerRef.current) return

        setLive(true)
        setEmotionActive(true)

        // Reset attention stats
        setAttentionStats({
            totalFrames: 0,
            attentionFrames: 0,
            attentionPercentage: 0
        })

        const INTERVAL_MS = 3000 // 3 seconds for emotion detection
        const tick = async () => {
            const video = videoRef.current
            const canvas = canvasRef.current
            const overlayCanvas = overlayCanvasRef.current

            if (video.videoWidth && video.videoHeight) {
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
                if (overlayCanvas) {
                    overlayCanvas.width = video.videoWidth
                    overlayCanvas.height = video.videoHeight
                }
            }

            const ctx = canvas.getContext('2d')
            const overlayCtx = overlayCanvas ? overlayCanvas.getContext('2d') : null

            // Clear overlay
            if (overlayCtx) {
                overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
            }

            // Always apply mirror effect
            ctx.save()
            ctx.translate(canvas.width, 0)
            ctx.scale(-1, 1)
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            ctx.restore()

            canvas.toBlob(async (blob) => {
                const fd = new FormData()
                fd.append('file', blob, 'frame.jpg')
                try {
                    const res = await fetch(API_ENDPOINTS.MATCH_WITH_EMOTION, { method: 'POST', body: fd })
                    const data = await res.json()

                    if (res.ok) {
                        const faceRecognition = data.face_recognition
                        const emotionDetection = data.emotion_detection

                        if (faceRecognition.threshold_met) {
                            setMsg(`Welcome, ${faceRecognition.user_name || 'User ' + faceRecognition.user_id}! ${faceRecognition.attendance_created ? '(New attendance)' : '(Already present)'}`)
                            setOk(true)
                        } else {
                            const sc = typeof faceRecognition.score === 'number' ?
                                ` (Confidence: ${(faceRecognition.score * 100).toFixed(1)}%)` : ''
                            setMsg(`No face match found${sc}`)
                            setOk(false)
                        }

                        // Handle emotion detection overlay
                        if (emotionDetection.success && overlayCtx) {
                            drawEmotionOverlay(overlayCtx, emotionDetection, canvas.width, canvas.height)
                            setCurrentEmotion(emotionDetection.emotion)
                            const isLooking = emotionDetection.gaze.is_looking_at_camera
                            setIsLookingAtCamera(isLooking)
                            setFaceBbox(emotionDetection.face_bbox)
                            updateAttentionStats(isLooking)
                        }
                    } else {
                        setMsg('Processing...'); setOk(false)
                    }
                } catch (e) {
                    setMsg('Live verification error: ' + e); setOk(false)
                }
            }, 'image/jpeg')
        }

        // Start immediate analysis, then repeat every 5 seconds
        setTimeout(tick, 1000)
        timerRef.current = setInterval(tick, INTERVAL_MS)
        setMsg('Live verification with emotion tracking started'); setOk(true)
    }

    const stopLive = () => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
        setLive(false)
        setEmotionActive(false)
        stopCamera()
        exitFullscreen()
        setMsg('Live verification stopped')

        // Clear emotion state
        setCurrentEmotion(null)
        setIsLookingAtCamera(false)
        setFaceBbox(null)
    }

    useEffect(() => () => {
        if (timerRef.current) clearInterval(timerRef.current)
        const v = videoRef.current
        const s = v && v.srcObject
        if (s && s.getTracks) s.getTracks().forEach(t => t.stop())
    }, [])

    return (
        <div ref={containerRef} className={fullscreen ? 'fixed inset-0 z-50 bg-black flex flex-col items-center justify-center w-full h-full' : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'} style={fullscreen ? { maxWidth: '100vw', maxHeight: '100vh' } : {}}>
            {/* Welcome Section (hide in fullscreen on all devices) */}
            {!fullscreen && (
                <div className="text-center mb-4 sm:mb-8">
                    <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">PresenSense</span>
                    </h2>
                </div>
            )}

            {/* Main Card */}
            <div className={fullscreen ? 'flex-1 flex flex-col items-center justify-center w-full h-full' : 'bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-4 sm:p-8'} style={fullscreen ? { borderRadius: 0, boxShadow: 'none', background: 'rgba(0,0,0,0.95)' } : {}}>
                <div className={fullscreen ? 'flex flex-col items-center justify-center w-full h-full' : 'grid lg:grid-cols-2 gap-4 sm:gap-8'} style={fullscreen ? { flex: 1 } : {}}>
                    {/* Video Section */}
                    <div className={fullscreen ? 'flex-1 flex flex-col items-center justify-center w-full h-full' : 'space-y-2 sm:space-y-4'} style={fullscreen ? { minHeight: '0' } : {}}>
                        <h3 className="mt-4 text-xl font-semibold text-white mb-2 sm:mb-4 flex items-center">
                            <svg className="mt-1 w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Camera Feed
                        </h3>
                        <div className={fullscreen ? 'relative w-full h-full flex-1 flex items-center justify-center' : 'relative'} style={fullscreen ? { minHeight: '0' } : {}}>
                            <video
                                className={fullscreen ? `w-full h-full object-contain bg-black scale-x-[-1]` : `w-full aspect-video rounded-2xl bg-black/50 border border-white/10 scale-x-[-1]`}
                                ref={videoRef}
                                autoPlay
                                playsInline
                                style={fullscreen ? { borderRadius: 0, maxHeight: '100vh', maxWidth: '100vw' } : {}}
                            />
                            {/* Emotion Detection Overlay Canvas */}
                            <canvas
                                ref={overlayCanvasRef}
                                className={fullscreen ? `absolute top-0 left-0 w-full h-full object-contain pointer-events-none scale-x-[-1]` : `absolute top-0 left-0 w-full h-full pointer-events-none rounded-2xl scale-x-[-1]`}
                                style={fullscreen ? { borderRadius: 0, maxHeight: '100vh', maxWidth: '100vw' } : {}}
                            />
                            {/* Status Indicator */}
                            {!fullscreen && (
                                <div className="absolute bottom-3 left-3">
                                    <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${streaming
                                        ? 'bg-green-500/80 text-white'
                                        : 'bg-red-500/80 text-white'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full mr-2 ${streaming ? 'bg-green-300' : 'bg-red-300'
                                            }`} />
                                        {streaming ? 'Live' : 'Offline'}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Reopen Fullscreen Button under camera view */}
                        {!fullscreen && live && cameraOn && (
                            <button
                                onClick={enterFullscreen}
                                className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 text-base font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                                style={{ boxShadow: '0 4px 24px 0 rgba(80,60,200,0.18)' }}
                                aria-label="Reopen Fullscreen"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
                                </svg>
                                Reopen Fullscreen
                            </button>
                        )}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>

                    {/* Controls Section (hidden in fullscreen, replaced by control bar) */}
                    {!fullscreen && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white flex items-center">
                                <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                                Camera Controls
                            </h3>

                            {/* Control Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={cameraOn ? stopCamera : start}
                                    className={`flex items-center justify-center px-4 py-3 ${cameraOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'} text-white rounded-xl font-medium transition-all duration-200 shadow-lg`}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cameraOn ? "M6 18L18 6M6 6l12 12" : "M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 00.707-.293l.707-.707M9 10v4a1 1 0 001 1h4M9 10H7a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2H9z"} />
                                    </svg>
                                    {cameraOn ? 'Stop Camera' : 'Start Camera'}
                                </button>
                                <button
                                    onClick={switchCamera}
                                    className="flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                    Switch Camera
                                </button>
                            </div>

                            {/* Verification Methods */}
                            <div className="space-y-3">
                                <h4 className="text-white font-medium">Verification Methods</h4>
                                <button
                                    onClick={verify}
                                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Capture & Verify
                                </button>
                                {!live ? (
                                    <button
                                        onClick={startLive}
                                        className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Start Live Verification
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopLive}
                                        className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                        </svg>
                                        Stop Live Verification
                                    </button>
                                )}
                            </div>

                            {/* Status Display */}
                            {msg && (
                                <div className={`p-4 rounded-xl border ${ok
                                    ? 'bg-green-500/20 border-green-500/30 text-green-200'
                                    : 'bg-red-500/20 border-red-500/30 text-red-200'
                                    }`}>
                                    <div className="flex items-center">
                                        {ok ? (
                                            <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                        <span className="font-medium">{msg}</span>
                                    </div>
                                </div>
                            )}

                            {/* Emotion Detection Stats */}
                            {emotionActive && (currentEmotion || attentionStats.totalFrames > 0) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {/* Current Emotion */}
                                    {currentEmotion && (
                                        <div className={`p-4 rounded-xl border ${isLookingAtCamera
                                            ? 'bg-green-500/20 border-green-500/30'
                                            : 'bg-orange-500/20 border-orange-500/30'
                                            }`}>
                                            <h4 className="text-white font-semibold mb-2 flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5H9m4.5-5H15a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5h-1.5m-5-5v5m5-5a1.5 1.5 0 00-1.5-1.5H9a1.5 1.5 0 00-1.5 1.5v5" />
                                                </svg>
                                                Current Status
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-white/70">Emotion:</span>
                                                    <span className="text-white font-medium">
                                                        {currentEmotion.dominant_emotion} ({(currentEmotion.confidence * 100).toFixed(1)}%)
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-white/70">Eye Contact:</span>
                                                    <span className={`font-medium ${isLookingAtCamera ? 'text-green-300' : 'text-orange-300'}`}>
                                                        {isLookingAtCamera ? '✅ Looking at camera' : '⚠️ Not focused'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Attention Statistics */}
                                    {attentionStats.totalFrames > 0 && (
                                        <div className="p-4 rounded-xl border bg-blue-500/20 border-blue-500/30">
                                            <h4 className="text-white font-semibold mb-2 flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                Attention Analytics
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-white/70">Total Frames:</span>
                                                    <span className="text-white font-medium">{attentionStats.totalFrames}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-white/70">Attention Frames:</span>
                                                    <span className="text-white font-medium">{attentionStats.attentionFrames}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-white/70">Attention Rate:</span>
                                                    <span className={`font-medium ${attentionStats.attentionPercentage >= 70 ? 'text-green-300' :
                                                        attentionStats.attentionPercentage >= 40 ? 'text-yellow-300' : 'text-red-300'
                                                        }`}>
                                                        {attentionStats.attentionPercentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {/* Fullscreen Control Bar */}
                    {fullscreen && (
                        <div className="fixed bottom-0 left-0 w-full z-50 bg-black/80 border-t border-white/10 flex flex-col items-center py-3 px-2" style={{ backdropFilter: 'blur(8px)' }}>
                            <div className="flex flex-row items-center justify-center gap-3 w-full max-w-2xl">
                                {/* Camera Toggle */}
                                <button
                                    onClick={cameraOn ? stopCamera : () => start({ fullscreen: true })}
                                    className={`flex items-center justify-center px-4 py-2 rounded-xl font-medium text-white transition-all duration-200 ${cameraOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'} shadow`}
                                    title={cameraOn ? 'Stop Camera' : 'Start Camera'}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cameraOn ? "M6 18L18 6M6 6l12 12" : "M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 00.707-.293l.707-.707M9 10v4a1 1 0 001 1h4M9 10H7a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2H9z"} />
                                    </svg>
                                    <span className="hidden md:inline">{cameraOn ? 'Stop Camera' : 'Start Camera'}</span>
                                </button>
                                {/* Switch Camera */}
                                <button
                                    onClick={switchCamera}
                                    className="flex items-center justify-center px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-200"
                                    title="Switch Camera"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                    <span className="hidden md:inline">Switch Camera</span>
                                </button>
                                {/* Capture & Verify */}
                                <button
                                    onClick={verify}
                                    className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200 shadow"
                                    title="Capture & Verify"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="hidden md:inline">Capture & Verify</span>
                                </button>
                                {/* Live Verification Toggle */}
                                {!live ? (
                                    <button
                                        onClick={startLive}
                                        className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow"
                                        title="Start Live Verification"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span className="hidden md:inline">Start Live</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopLive}
                                        className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow"
                                        title="Stop Live Verification"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                        </svg>
                                        <span className="hidden md:inline">Stop Live</span>
                                    </button>
                                )}
                                {/* Fullscreen Toggle */}
                                <button
                                    onClick={fullscreen ? exitFullscreen : enterFullscreen}
                                    className="flex items-center justify-center px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-200"
                                    title={fullscreen ? 'Exit Fullscreen' : 'Go Fullscreen'}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={fullscreen ? "M6 18L18 6M6 6l12 12" : "M4 4h16v16H4z"} />
                                    </svg>
                                    <span className="hidden md:inline">{fullscreen ? 'Exit Full Screen' : 'Fullscreen'}</span>
                                </button>
                            </div>
                            {/* Status in fullscreen */}
                            {msg && (
                                <div className={`mt-3 p-3 rounded-xl border text-center w-full max-w-2xl ${ok
                                    ? 'bg-green-500/20 border-green-500/30 text-green-200'
                                    : 'bg-red-500/20 border-red-500/30 text-red-200'
                                    }`}>
                                    <span className="font-medium">{msg}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Instructions (hide in fullscreen) */}
            {!fullscreen && (
                <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Instructions
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm text-white/70">
                        <div className="flex items-start">
                            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                <span className="text-purple-300 font-semibold text-xs">1</span>
                            </div>
                            <div>
                                <strong className="text-white">Start Camera:</strong> Click "Start Camera" to begin
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                <span className="text-purple-300 font-semibold text-xs">2</span>
                            </div>
                            <div>
                                <strong className="text-white">Position Face:</strong> Ensure good lighting and clear visibility
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                <span className="text-purple-300 font-semibold text-xs">3</span>
                            </div>
                            <div>
                                <strong className="text-white">Single Capture:</strong> Use "Capture & Verify" for one-time check
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                <span className="text-purple-300 font-semibold text-xs">4</span>
                            </div>
                            <div>
                                <strong className="text-white">Live Mode:</strong> Use "Live Verification" for automatic scanning
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}
