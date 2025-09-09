import React, { useEffect, useState } from 'react'
import { API_ENDPOINTS } from '../config.js'

export default function Attendance() {
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [msg, setMsg] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredRows, setFilteredRows] = useState([])

    const load = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch(API_ENDPOINTS.ATTENDANCE)
            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || 'Failed to load attendance')
            setRows(data)
            setFilteredRows(data)
        } catch (e) {
            setError(String(e))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    useEffect(() => {
        if (!searchTerm) {
            setFilteredRows(rows)
        } else {
            const filtered = rows.filter(row =>
                row.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.timestamp.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredRows(filtered)
        }
    }, [searchTerm, rows])

    const deleteRow = async (attendanceId) => {
        setMsg('Deleting...')
        try {
            const res = await fetch(`${API_ENDPOINTS.ATTENDANCE}/${attendanceId}`, { method: 'DELETE' })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.detail || 'Delete failed')
            setRows(prev => prev.filter(r => r.attendance_id !== attendanceId))
            setMsg('Record deleted successfully')
            setTimeout(() => setMsg(''), 3000)
        } catch (e) {
            setMsg(String(e))
            setTimeout(() => setMsg(''), 3000)
        }
    }

    const deleteUserAll = async (userId) => {
        if (!confirm(`Delete all attendance records for user "${userId}"?`)) return
        setMsg(`Deleting records for ${userId}...`)
        try {
            const res = await fetch(`${API_ENDPOINTS.ATTENDANCE}?user_id=${encodeURIComponent(userId)}`, { method: 'DELETE' })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.detail || 'Delete failed')
            setRows(prev => prev.filter(r => r.user_id !== userId))
            setMsg(`Deleted ${data.deleted || 0} records for user ${userId}`)
            setTimeout(() => setMsg(''), 3000)
        } catch (e) {
            setMsg(String(e))
            setTimeout(() => setMsg(''), 3000)
        }
    }

    const deleteAll = async () => {
        if (!confirm('Delete ALL attendance records? This action cannot be undone.')) return
        setMsg('Deleting all records...')
        try {
            const res = await fetch(API_ENDPOINTS.ATTENDANCE, { method: 'DELETE' })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.detail || 'Delete failed')
            setRows([])
            setMsg(`Deleted ${data.deleted || 0} records`)
            setTimeout(() => setMsg(''), 3000)
        } catch (e) {
            setMsg(String(e))
            setTimeout(() => setMsg(''), 3000)
        }
    }

    const formatDate = (timestamp) => {
        try {
            const date = new Date(timestamp)
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        } catch {
            return timestamp
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-white/70">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Loading attendance records...</span>
            </div>
        </div>
    )

    if (error) return (
        <div className="p-6 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200">
            <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={load}
                        className="flex items-center px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-200 rounded-xl hover:bg-blue-500/30 transition-all duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>

                    <button
                        onClick={deleteAll}
                        className="flex items-center px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl hover:bg-red-500/30 transition-all duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete All
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-64 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Search records..."
                    />
                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Status Message */}
            {msg && (
                <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-200">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{msg}</span>
                    </div>
                </div>
            )}

            {/* Records Count */}
            <div className="text-white/60 text-sm">
                Showing {filteredRows.length} of {rows.length} records
                {searchTerm && <span> (filtered by "{searchTerm}")</span>}
            </div>

            {/* Records Table */}
            {filteredRows.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-white font-medium mb-2">
                        {rows.length === 0 ? 'No Attendance Records' : 'No Matching Records'}
                    </h3>
                    <p className="text-white/60">
                        {rows.length === 0
                            ? 'No attendance has been recorded yet.'
                            : 'Try adjusting your search criteria.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white/10 border-b border-white/10">
                                    <th className="text-left p-4 font-semibold text-white">Time</th>
                                    <th className="text-left p-4 font-semibold text-white">User ID</th>
                                    <th className="text-left p-4 font-semibold text-white">Name</th>
                                    <th className="text-center p-4 font-semibold text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map((row, index) => (
                                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                                        <td className="p-4 text-white/80">{formatDate(row.timestamp)}</td>
                                        <td className="p-4 text-white font-medium">{row.user_id}</td>
                                        <td className="p-4 text-white/80">{row.user_name || 'N/A'}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => deleteRow(row.attendance_id)}
                                                    className="px-3 py-1 text-xs bg-red-500/20 border border-red-500/30 text-red-200 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                                                >
                                                    Delete Record
                                                </button>
                                                <button
                                                    onClick={() => deleteUserAll(row.user_id)}
                                                    className="px-3 py-1 text-xs bg-orange-500/20 border border-orange-500/30 text-orange-200 rounded-lg hover:bg-orange-500/30 transition-all duration-200"
                                                >
                                                    Delete All User
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4 p-4">
                        {filteredRows.map((row, index) => (
                            <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="text-white font-medium">{row.user_id}</h4>
                                        <p className="text-white/60 text-sm">{row.user_name || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/80 text-sm">{formatDate(row.timestamp)}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => deleteRow(row.attendance_id)}
                                        className="flex-1 px-3 py-2 text-xs bg-red-500/20 border border-red-500/30 text-red-200 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                                    >
                                        Delete Record
                                    </button>
                                    <button
                                        onClick={() => deleteUserAll(row.user_id)}
                                        className="flex-1 px-3 py-2 text-xs bg-orange-500/20 border border-orange-500/30 text-orange-200 rounded-lg hover:bg-orange-500/30 transition-all duration-200"
                                    >
                                        Delete All User
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{rows.length}</p>
                            <p className="text-white/60 text-sm">Total Records</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{new Set(rows.map(r => r.user_id)).size}</p>
                            <p className="text-white/60 text-sm">Unique Users</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {rows.length > 0 ? formatDate(rows[0].timestamp).split(',')[0] : 'N/A'}
                            </p>
                            <p className="text-white/60 text-sm">Latest Record</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
