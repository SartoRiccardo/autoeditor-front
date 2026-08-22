import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { VideoSummary } from '../lib/types'

export default function VideoListPage() {
  const [videos, setVideos] = useState<VideoSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listVideos().then(setVideos).catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="p-6 text-sm text-red-400">{error}</p>
  if (!videos) return <p className="p-6 text-sm text-neutral-500">Loading…</p>

  const inReview = videos.filter((v) => v.status === 'in_review')
  const submitted = videos.filter((v) => v.status === 'submitted')

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <h1 className="mb-4 text-lg font-semibold text-neutral-50">In review</h1>
      {inReview.length === 0 && <p className="mb-8 text-sm text-neutral-500">Nothing to review.</p>}
      <ul className="mb-8 space-y-2">
        {inReview.map((v) => (
          <li key={v.id}>
            <Link
              to={`/videos/${v.id}`}
              className="flex items-center justify-between rounded-xl bg-neutral-900 px-4 py-3 active:bg-neutral-800"
            >
              <span className="truncate text-neutral-100">{v.title}</span>
              <span className="ml-3 shrink-0 text-xs text-neutral-500">
                {v.viewed_count}/{v.clip_count} viewed
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {submitted.length > 0 && (
        <>
          <h2 className="mb-4 text-lg font-semibold text-neutral-50">Submitted</h2>
          <ul className="space-y-2">
            {submitted.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between rounded-xl bg-neutral-900/50 px-4 py-3 opacity-60"
              >
                <span className="truncate text-neutral-300">{v.title}</span>
                <span className="ml-3 shrink-0 text-xs text-neutral-500">✓ submitted</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
