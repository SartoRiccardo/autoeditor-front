import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { api } from './lib/api'
import LoginPage from './pages/LoginPage'
import VideoListPage from './pages/VideoListPage'
import VideoReviewPage from './pages/VideoReviewPage'
import ClipTrimPage from './pages/ClipTrimPage'
import SettingsPage from './pages/SettingsPage'

function TopBar() {
  return (
    <div className="flex items-center justify-between border-b border-neutral-900 px-4 py-3">
      <Link to="/" className="text-sm font-semibold text-neutral-100">
        Clip Review
      </Link>
      <Link to="/settings" className="text-sm text-neutral-500">
        Settings
      </Link>
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const location = useLocation()

  useEffect(() => {
    api.me().then((r) => setAuthed(r.authenticated)).catch(() => setAuthed(false))
  }, [])

  if (authed === null) {
    return <div className="p-6 text-sm text-neutral-500">Loading…</div>
  }

  if (!authed) {
    if (location.pathname === '/login') return <LoginPage />
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<VideoListPage />} />
        <Route path="/videos/:videoId" element={<VideoReviewPage />} />
        <Route path="/videos/:videoId/clips/:clipId" element={<ClipTrimPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
