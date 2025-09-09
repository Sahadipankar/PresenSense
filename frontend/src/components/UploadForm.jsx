import React, { useState } from 'react'
import { API_ENDPOINTS } from '../config.js'

export default function UploadForm() {
    const [name, setName] = useState('')
    const [file, setFile] = useState(null)
    const [msg, setMsg] = useState('')
    const [ok, setOk] = useState(false)
    const [loading, setLoading] = useState(false)
    const [dragOver, setDragOver] = useState(false)

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!name || !file) {
            setMsg('Please provide name and image');
            setOk(false);
            return
        }

        const fd = new FormData()
        fd.append('name', name)
        fd.append('file', file)
        setMsg('Uploading...')
        setOk(false)
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

            setMsg(`Successfully registered! User ID: ${data.user_id}`)
            setOk(true)
            setName('')
            setFile(null)
        } catch (err) {
            setMsg(String(err))
            setOk(false)
        } finally {
            setLoading(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const files = e.dataTransfer.files
        if (files.length > 0) {
            const selectedFile = files[0]
            if (selectedFile.type.startsWith('image/')) {
                setFile(selectedFile)
            } else {
                setMsg('Please select an image file')
                setOk(false)
            }
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setDragOver(false)
    }

    return (
        <div className="space-y-6">
            <form onSubmit={onSubmit} className="space-y-6">
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

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                        Photo Upload
                    </label>

                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dragOver
                                ? 'border-purple-400 bg-purple-500/10'
                                : 'border-white/30 hover:border-white/50 bg-white/5'
                            }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        {file ? (
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-green-500/20 rounded-xl mx-auto flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-medium">{file.name}</p>
                                    <p className="text-white/60 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFile(null)}
                                    className="text-red-400 hover:text-red-300 text-sm underline"
                                >
                                    Remove file
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-white/10 rounded-xl mx-auto flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white/80 font-medium">Drop image here or click to browse</p>
                                    <p className="text-white/50 text-sm mt-1">Supported formats: JPG, PNG, WebP (Max 10MB)</p>
                                </div>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            required
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !name || !file}
                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                            Uploading...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Register User
                        </>
                    )}
                </button>

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
            </form>

            {/* Tips */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <h4 className="text-white font-semibold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Photo Guidelines
                </h4>
                <div className="grid sm:grid-cols-2 gap-4 text-sm text-white/70">
                    <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                            <strong className="text-white">Clear frontal view:</strong> Face should be directly facing the camera
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                            <strong className="text-white">Good lighting:</strong> Avoid shadows and ensure even lighting
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                            <strong className="text-white">High resolution:</strong> Use images with good quality and clarity
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                            <strong className="text-white">No accessories:</strong> Avoid sunglasses or masks for better recognition
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
