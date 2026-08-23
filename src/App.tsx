import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useMeQuery } from './lib/queries'
import LoginPage from './pages/LoginPage'
import VideoListPage from './pages/VideoListPage'
import ProjectEditorPage from './pages/ProjectEditorPage'
import SettingsPage from './pages/SettingsPage'
import HealthDot from './components/HealthDot'

function TopBar() {
  return (
    <div
      className="flex items-center justify-between border-b border-neutral-900 px-4 pb-3"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
    >
      <Link to="/" className="text-sm font-semibold text-neutral-100">
        Clip Review
      </Link>
      <div className="flex items-center gap-3">
        <HealthDot />
        <Link to="/settings" className="text-sm text-neutral-500">
          Settings
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const { data: me, isPending } = useMeQuery()

  if (isPending) {
    return <div className="p-6 text-sm text-neutral-500">Loading…</div>
  }

  if (!me?.authenticated) {
    if (location.pathname === '/login') return <LoginPage />
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Toaster theme="dark" position="top-center" richColors />
      <TopBar />
      <Routes>
        <Route path="/" element={<VideoListPage />} />
        <Route path="/videos/:videoId" element={<ProjectEditorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
