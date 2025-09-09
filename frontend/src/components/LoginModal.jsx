import React, { useState } from 'react'
import { ADMIN_CREDENTIALS } from '../config.js'

export default function LoginModal({ onLogin, onCancel }) {
    const [credentials, setCredentials] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (credentials.username === ADMIN_CREDENTIALS.username &&
            credentials.password === ADMIN_CREDENTIALS.password) {
            onLogin(true)
        } else {
            setError('Invalid credentials')
            onLogin(false)
        }

        setLoading(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                    <div className="p-6">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Admin Login</h2>
                            <p className="text-white/60 mt-1">Enter your credentials to access admin panel</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={credentials.username}
                                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white font-medium hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        'Login'
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Demo credentials hint */}
                        <div className="mt-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-xs text-blue-200">
                                <strong>Demo credentials:</strong><br />
                                Username: admin<br />
                                Password: admin123
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
