import React, { useState } from 'react'
import UploadForm from './UploadForm'
import CaptureForm from './CaptureForm'
import Attendance from './Attendance'

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('upload')

    const tabs = [
        {
            id: 'upload',
            name: 'Upload',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            ),
            description: 'Register users by uploading their photos'
        },
        {
            id: 'capture',
            name: 'Capture',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            description: 'Register users using camera capture'
        },
        {
            id: 'attendance',
            name: 'Attendance',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            description: 'View and manage attendance records'
        }
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Admin Panel</span>
                </h2>
                <p className="text-lg text-white/70 max-w-2xl mx-auto">
                    Manage face recognition attendance system. Register new users and monitor attendance records.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-2">
                    <div className="grid grid-cols-3 gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative p-4 rounded-xl transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                                        : 'text-white/70 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex flex-col items-center space-y-2">
                                    <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
                                        }`}>
                                        {tab.icon}
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold">{tab.name}</div>
                                        <div className={`text-xs mt-1 ${activeTab === tab.id ? 'text-white/90' : 'text-white/50'
                                            }`}>
                                            {tab.description}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
                <div className="p-6 sm:p-8">
                    {activeTab === 'upload' && (
                        <div>
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Register User by Upload</h3>
                                    <p className="text-white/70 mt-1">Upload a clear frontal face image. Supported formats: JPG, PNG, WebP.</p>
                                </div>
                            </div>
                            <UploadForm />
                        </div>
                    )}

                    {activeTab === 'capture' && (
                        <div>
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Register User by Camera</h3>
                                    <p className="text-white/70 mt-1">Position the face in good lighting and capture a clear image.</p>
                                </div>
                            </div>
                            <CaptureForm />
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div>
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Attendance Records</h3>
                                    <p className="text-white/70 mt-1">Latest verifications recorded by the system.</p>
                                </div>
                            </div>
                            <Attendance />
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">Active</p>
                            <p className="text-white/60 text-sm">System Status</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">Secure</p>
                            <p className="text-white/60 text-sm">Face Recognition</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">Real-time</p>
                            <p className="text-white/60 text-sm">Processing</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
