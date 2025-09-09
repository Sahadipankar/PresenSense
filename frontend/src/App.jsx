import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PublicPage from './pages/PublicPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}