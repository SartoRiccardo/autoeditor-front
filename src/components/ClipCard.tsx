import { Link } from 'react-router-dom'
import type { Clip } from '../lib/types'

export default function ClipCard({ videoId, clip }: { videoId: number; clip: Clip }) {
  return (
    <Link
      to={`/videos/${videoId}/clips/${clip.id}`}
      className="relative block overflow-hidden rounded-lg bg-neutral-900 aspect-video"
    >
      <video
        src={`/media/${clip.proxy_video_path}`}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        className="h-full w-full object-cover opacity-90"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
        <span className="truncate text-[11px] text-neutral-200">{clip.take_label}</span>
        {clip.viewed ? (
          <span className={`text-[11px] ${clip.usable ? 'text-emerald-400' : 'text-red-400'}`}>
            {clip.usable ? '✓' : '✕'}
          </span>
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        )}
      </div>
    </Link>
  )
}
