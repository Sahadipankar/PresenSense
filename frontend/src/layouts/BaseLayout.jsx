import React from 'react'
import { Link } from 'react-router-dom'

export default function BaseLayout({ children, headerContent, footerContent }) {
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
                        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
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
                        </Link>

                        {/* Header Content (Navigation) */}
                        {headerContent}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1">
                {children}
            </main>

            {/* Footer */}
            {footerContent}
        </div>
    )
}
