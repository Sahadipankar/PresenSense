import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
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
                            <Link
                                to="/"
                                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200 text-sm font-medium"
                            >
                                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Home
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        {/* 404 Illustration */}
                        <div className="mb-8">
                            <div className="w-32 h-32 mx-auto bg-white/10 rounded-3xl border border-white/20 flex items-center justify-center mb-6">
                                <svg className="w-16 h-16 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.881-6.084 2.291.373-.45.899-.772 1.514-.922A5.975 5.975 0 0112 15c2.34 0 4.47.881 6.084 2.291-.373-.45-.899-.772-1.514-.922zM15 11V9a3 3 0 00-6 0v2M9 12h6v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
                                </svg>
                            </div>
                            <h1 className="text-8xl font-bold text-white/20 mb-4">404</h1>
                        </div>

                        {/* Error Message */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
                            <p className="text-white/70 text-lg mb-8">
                                The page you're looking for doesn't exist or has been moved to a different location.
                            </p>

                            {/* Action Buttons */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Link
                                    to="/"
                                    className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Public Access
                                </Link>
                                <Link
                                    to="/admin"
                                    className="flex items-center justify-center px-6 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Admin Portal
                                </Link>
                            </div>
                        </div>

                        {/* Help Section */}
                        <div className="mt-12 text-center">
                            <h3 className="text-white font-semibold mb-4">Need Help?</h3>
                            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                    <h4 className="text-white text-sm font-medium">Go Home</h4>
                                    <p className="text-white/60 text-xs mt-1">Return to the main page</p>
                                </div>

                                <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                    <h4 className="text-white text-sm font-medium">Refresh</h4>
                                    <p className="text-white/60 text-xs mt-1">Try reloading the page</p>
                                </div>

                                <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-white text-sm font-medium">Contact</h4>
                                    <p className="text-white/60 text-xs mt-1">Get technical support</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
