// API Configuration using environment variables
// For production: Set VITE_API_BASE_URL in environment variables
// For local development: create .env.local file

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// API Endpoints
export const API_ENDPOINTS = {
    UPLOAD: `${API_BASE_URL}/admin/upload`,
    ATTENDANCE: `${API_BASE_URL}/admin/attendance`,
    MATCH: `${API_BASE_URL}/match/`,
    STREAM: `${API_BASE_URL}/match/stream`,
    HEALTH: `${API_BASE_URL}/health`,
    READY: `${API_BASE_URL}/ready`
}

// Log the current configuration
console.log(`API Base URL: ${API_BASE_URL}`)
console.log(`Environment: ${import.meta.env.DEV ? 'Development' : 'Production'}`)
console.log(`VITE_API_BASE_URL: ${import.meta.env.VITE_API_BASE_URL || 'Not set'}`)

// Admin login credentials (for demo purposes - in production use proper auth)
export const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
}
