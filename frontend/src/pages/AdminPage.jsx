import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AdminPanel from '../components/AdminPanel'
import LoginModal from '../components/LoginModal'

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [showLoginModal, setShowLoginModal] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        // Check if admin is already authenticated (from sessionStorage)
        const adminAuth = sessionStorage.getItem('adminAuthenticated')
        if (adminAuth === 'true') {
            setIsAuthenticated(true)
            setShowLoginModal(false)
        }
    }, [])

    const handleAdminLogin = (success) => {
        if (success) {
            setIsAuthenticated(true)
            setShowLoginModal(false)
            sessionStorage.setItem('adminAuthenticated', 'true')
        } else {
            setIsAuthenticated(false)
            setShowLoginModal(true)
        }
    }

    const handleLogout = () => {
        setIsAuthenticated(false)
        setShowLoginModal(true)
        sessionStorage.removeItem('adminAuthenticated')
    }

    const handleCancel = () => {
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-800/20 via-transparent to-transparent"></div>
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-800/10 via-transparent to-transparent"></div>

            {/* Header */}
            <header className="relative z-10 bg-white/5 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">PresenSense</h1>
                                <p className="text-xs text-white/60">Smart Face Recognition Attendance</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <>
                                    <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl text-sm font-medium border border-purple-500/30">
                                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Admin Panel
                                    </span>
                                    <Link
                                        to="/"
                                        className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200 text-sm font-medium"
                                    >
                                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Public Access
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl hover:bg-red-500/30 transition-all duration-200 text-sm font-medium"
                                    >
                                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/"
                                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200 text-sm font-medium"
                                >
                                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Back to Public
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1">
                {showLoginModal && !isAuthenticated && (
                    <LoginModal
                        onLogin={handleAdminLogin}
                        onCancel={handleCancel}
                    />
                )}
                {isAuthenticated && <AdminPanel />}
            </main>

            {/* Footer */}
            {isAuthenticated && (
                <footer className="relative z-10 bg-white/5 backdrop-blur-lg border-t border-white/10 mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between">
                            <div className="text-white/60 text-sm">
                                © 2025 PresenSense. Administrative Dashboard.
                            </div>
                            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                                <div className="flex items-center text-purple-400 text-sm">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
                                    Admin Session Active
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    )
}
