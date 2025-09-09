import React, { useEffect, useRef, useState } from 'react'
import { API_ENDPOINTS } from '../config.js'

export default function CaptureForm() {
    const [name, setName] = useState('')
    const [msg, setMsg] = useState('')
    const [ok, setOk] = useState(false)
    const [loading, setLoading] = useState(false)
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const [streaming, setStreaming] = useState(false)
    const [facing, setFacing] = useState('user') // 'user' | 'environment'
    const [cameras, setCameras] = useState([])
    const cameraIdxRef = useRef(0)
    // Mirror is always enabled by default

    const startWithFacing = async (targetFacing) => {
        try {
            const current = videoRef.current && videoRef.current.srcObject
            if (current && current.getTracks) current.getTracks().forEach(t => t.stop())
            let stream = null

            // Prefer selecting deviceId explicitly on mobile for more reliable switching
            try {
                const devices = await navigator.mediaDevices.enumerateDevices()
                const vids = devices.filter(d => d.kind === 'videoinput')
                const pickByLabel = (want) => {
                    const kw = want === 'environment' ? ['back', 'rear', 'environment'] : ['front', 'user']
                    const m = vids.find(v => (v.label || '').toLowerCase().split(/[\s\-_/]/).some(tok => kw.includes(tok)))
                    return m || null
                }
                let target = pickByLabel(targetFacing)
                if (!target) {
                    if (vids.length >= 2) target = targetFacing === 'environment' ? vids[vids.length - 1] : vids[0]
                    else target = vids[0] || null
                }
                if (target) {
                    stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: target.deviceId } } })
                }
            } catch (_) { }

            // Try exact, then ideal, then default
            try {
                if (!stream) stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: targetFacing } } })
            } catch (_) {
                try {
                    if (!stream) stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: targetFacing } } })
                } catch (__) {
                    if (!stream) stream = await navigator.mediaDevices.getUserMedia({ video: true })
                }
            }

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setStreaming(true)
            }
            setFacing(targetFacing)
            setMsg('Camera started'); setOk(true)

            // Populate device list
            const devices = await navigator.mediaDevices.enumerateDevices()
            const vids = devices.filter(d => d.kind === 'videoinput')
            setCameras(vids)
        } catch (e) {
            setMsg('Failed to start camera: ' + e); setOk(false)
        }
    }

    const start = async () => startWithFacing(facing)

    const switchCamera = async () => {
        const next = facing === 'user' ? 'environment' : 'user'
        setMsg('Switching camera...')
        try { await startWithFacing(next) } catch { }
    }

    const nextDevice = async () => {
        try {
            const devices = cameras.length ? cameras : (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput')
            if (!devices.length) { setMsg('No cameras found'); return }
            cameraIdxRef.current = (cameraIdxRef.current + 1) % devices.length
            const target = devices[cameraIdxRef.current]
            const current = videoRef.current && videoRef.current.srcObject
            if (current && current.getTracks) current.getTracks().forEach(t => t.stop())
            const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: target.deviceId } } })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setStreaming(true)
            }
            setCameras(devices)
            setMsg(`Switched to device: ${target.label || cameraIdxRef.current + 1}`)
        } catch (e) {
            setMsg('Failed to switch device: ' + e)
        }
    }

    const capture = async () => {
        if (!streaming) { setMsg('Start camera first'); setOk(false); return }
        if (!name) { setMsg('Enter name first'); setOk(false); return }

        const video = videoRef.current
        const canvas = canvasRef.current
        if (video.videoWidth && video.videoHeight) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
        }
        const ctx = canvas.getContext('2d')

        // Always apply mirror effect
        ctx.save()
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ctx.restore()

        canvas.toBlob(async (blob) => {
            const fd = new FormData()
            fd.append('name', name)
            fd.append('file', blob, `${name}.jpg`)
            setMsg('Uploading...'); setOk(false)
            setLoading(true)

            try {
                const res = await fetch(API_ENDPOINTS.UPLOAD, { method: 'POST', body: fd })
                const ct = res.headers.get('content-type') || ''
                let data = null
                let text = ''

                if (ct.includes('application/json')) {
                    data = await res.json()
                } else {
                    text = await res.text()
                }

                if (!res.ok) {
                    const detail = data?.detail || data?.message || text || `HTTP ${res.status}`
                    throw new Error(detail)
                }

                setMsg(`Successfully registered! User ID: ${data.user_id}`); setOk(true)
                setName('')
            } catch (err) {
                setMsg(String(err)); setOk(false)
            } finally {
                setLoading(false)
            }
        }, 'image/jpeg')
    }

    useEffect(() => () => {
        const v = videoRef.current
        const s = v && v.srcObject
        if (s && s.getTracks) s.getTracks().forEach(t => t.stop())
    }, [])

    return (
        <div className="space-y-6">
            {/* Name Input */}
            <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                    Full Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter the person's full name"
                    required
                />
            </div>

            {/* Camera Section */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Video Feed */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Camera Preview
                        </h4>

                    </div>

                    <div className="relative">
                        <video
                            className="w-full aspect-video rounded-2xl bg-black/50 border border-white/10 scale-x-[-1]"
                            ref={videoRef}
                            autoPlay
                            playsInline
                        />

                        {/* Status Indicator */}
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
                    </div>

                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

                {/* Controls */}
                <div className="space-y-4">
                    <h4 className="text-white font-semibold flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                        Camera Controls
                    </h4>

                    {/* Control Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={start}
                            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 00.707-.293l.707-.707M9 10v4a1 1 0 001 1h4M9 10H7a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2H9z" />
                            </svg>
                            Start Camera
                        </button>

                        <button
                            onClick={switchCamera}
                            className="flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Switch
                        </button>

                        <button
                            onClick={nextDevice}
                            className="flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Next Device
                        </button>

                        <button
                            onClick={capture}
                            disabled={loading || !streaming || !name}
                            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            ) : (
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                            Capture & Register
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Message */}
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

            {/* Capture Tips */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <h4 className="text-white font-semibold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Capture Tips
                </h4>
                <div className="grid sm:grid-cols-2 gap-4 text-sm text-white/70">
                    <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                            <strong className="text-white">Good lighting:</strong> Ensure the face is well-lit without harsh shadows
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                            <strong className="text-white">Center the face:</strong> Position the face in the center of the frame
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                            <strong className="text-white">Remove accessories:</strong> Take off glasses, hats, or masks
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                            <strong className="text-white">Stable position:</strong> Keep still when capturing the image
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
