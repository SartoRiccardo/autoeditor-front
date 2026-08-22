import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { VideoDetail } from '../lib/types'
import ClipCard from '../components/ClipCard'

export default function VideoReviewPage() {
  const { videoId } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<VideoDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    api.getVideo(Number(videoId)).then(setDetail).catch((e) => setError(e.message))
  }

  useEffect(load, [videoId])

  if (error) return <p className="p-6 text-sm text-red-400">{error}</p>
  if (!detail) return <p className="p-6 text-sm text-neutral-500">Loading…</p>

  const { video, clips } = detail
  const allViewed = clips.length > 0 && clips.every((c) => c.viewed)
  const isSubmitted = video.status === 'submitted'

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.submitVideo(video.id)
      navigate('/')
    } catch (e) {
      setError((e as Error).message)
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/" className="text-sm text-neutral-500">
          ← back
        </Link>
      </div>
      <h1 className="mb-1 text-lg font-semibold text-neutral-50">{video.title}</h1>
      <p className="mb-4 text-xs text-neutral-500">
        {clips.filter((c) => c.viewed).length}/{clips.length} viewed
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {clips.map((clip) => (
          <ClipCard key={clip.id} videoId={video.id} clip={clip} />
        ))}
      </div>

      {!isSubmitted && (
        <div className="fixed inset-x-0 bottom-0 border-t border-neutral-800 bg-neutral-950/95 p-4 backdrop-blur">
          <button
            disabled={!allViewed || submitting}
            onClick={handleSubmit}
            className="mx-auto block w-full max-w-lg rounded-full bg-neutral-100 py-3 text-sm font-medium text-neutral-900 disabled:opacity-30"
          >
            {allViewed ? (submitting ? 'Submitting…' : 'Submit project') : 'Review all clips to submit'}
          </button>
        </div>
      )}
    </div>
  )
}
