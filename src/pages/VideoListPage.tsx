import { Link } from 'react-router-dom'
import { useArchiveVideoMutation, useRestoreVideoMutation, useVideosQuery } from '../lib/queries'

function daysLeft(purgeAt: string) {
  const ms = new Date(purgeAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export default function VideoListPage() {
  const { data: videos, isPending, error } = useVideosQuery()
  const archiveVideo = useArchiveVideoMutation()
  const restoreVideo = useRestoreVideoMutation()

  const busyId = archiveVideo.isPending
    ? archiveVideo.variables
    : restoreVideo.isPending
      ? restoreVideo.variables
      : null

  if (error) return <p className="p-6 text-sm text-red-400">{(error as Error).message}</p>
  if (isPending) return <p className="p-6 text-sm text-neutral-500">Loading…</p>

  const inReview = videos.filter((v) => !v.archived_at && v.status === 'in_review')
  const submitted = videos.filter((v) => !v.archived_at && v.status === 'submitted')
  const archived = videos.filter((v) => v.archived_at)

  const handleArchive = (id: number) => {
    if (!confirm('Delete this project? It can be restored for 7 days, then it is gone for good.')) return
    archiveVideo.mutate(id)
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <h1 className="mb-4 text-lg font-semibold text-neutral-50">In review</h1>
      {inReview.length === 0 && <p className="mb-8 text-sm text-neutral-500">Nothing to review.</p>}
      <ul className="mb-8 space-y-2">
        {inReview.map((v) => (
          <li key={v.id} className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-3">
            <Link to={`/videos/${v.id}`} className="flex min-w-0 flex-1 items-center justify-between">
              <span className="truncate text-neutral-100">{v.title}</span>
              <span className="ml-3 shrink-0 text-xs text-neutral-500">
                {v.viewed_count}/{v.clip_count} viewed
              </span>
            </Link>
            <button
              onClick={() => handleArchive(v.id)}
              disabled={busyId === v.id}
              className="shrink-0 text-xs text-neutral-600 disabled:opacity-30"
            >
              delete
            </button>
          </li>
        ))}
      </ul>

      {submitted.length > 0 && (
        <>
          <h2 className="mb-4 text-lg font-semibold text-neutral-50">Submitted</h2>
          <ul className="mb-8 space-y-2">
            {submitted.map((v) => (
              <li
                key={v.id}
                className="flex items-center gap-2 rounded-xl bg-neutral-900/50 px-4 py-3 opacity-60"
              >
                <span className="min-w-0 flex-1 truncate text-neutral-300">{v.title}</span>
                <span className="shrink-0 text-xs text-neutral-500">✓ submitted</span>
                <button
                  onClick={() => handleArchive(v.id)}
                  disabled={busyId === v.id}
                  className="shrink-0 text-xs text-neutral-600 disabled:opacity-30"
                >
                  delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {archived.length > 0 && (
        <>
          <h2 className="mb-4 text-lg font-semibold text-neutral-50">Archived</h2>
          <ul className="space-y-2">
            {archived.map((v) => (
              <li
                key={v.id}
                className="flex items-center gap-2 rounded-xl bg-neutral-900/30 px-4 py-3"
              >
                <span className="min-w-0 flex-1 truncate text-neutral-500 line-through">{v.title}</span>
                <span className="shrink-0 text-xs text-neutral-600">
                  {v.purge_at ? `purges in ${daysLeft(v.purge_at)}d` : ''}
                </span>
                <button
                  onClick={() => restoreVideo.mutate(v.id)}
                  disabled={busyId === v.id}
                  className="shrink-0 text-xs text-amber-400 disabled:opacity-30"
                >
                  restore
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
