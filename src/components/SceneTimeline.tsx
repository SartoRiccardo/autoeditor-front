import { sceneColor } from '../lib/timeline'
import type { Clip, Scene } from '../lib/types'

interface Props {
  scenes: Scene[]
  clips: Clip[]
  duration: number
  selectedClipId: number | null
  viewportStart: number
  zoom: number
  onSelectClip: (id: number) => void
}

function clipColor(clip: Clip) {
  if (!clip.viewed) return 'bg-neutral-500'
  return clip.usable ? 'bg-emerald-500' : 'bg-red-500'
}

export default function SceneTimeline({
  scenes,
  clips,
  duration,
  selectedClipId,
  viewportStart,
  zoom,
  onSelectClip,
}: Props) {
  const pct = (t: number) => (duration > 0 ? (t / duration) * 100 : 0)

  return (
    <div className="relative h-14 w-full select-none overflow-hidden rounded-lg bg-neutral-900">
      {scenes.map((scene, i) => (
        <div
          key={scene.id}
          className={`absolute inset-y-0 ${sceneColor(i)}`}
          style={{ left: `${pct(scene.start)}%`, width: `${pct(scene.end - scene.start)}%` }}
          title={scene.label}
        />
      ))}

      {clips.map((clip) => (
        <button
          key={clip.id}
          type="button"
          onClick={() => onSelectClip(clip.id)}
          className={`absolute bottom-1 top-1/2 rounded-sm ${clipColor(clip)} ${
            clip.id === selectedClipId ? 'ring-2 ring-white' : ''
          }`}
          style={{ left: `${pct(clip.start)}%`, width: `${Math.max(pct(clip.end - clip.start), 0.5)}%` }}
        />
      ))}

      <div
        className="pointer-events-none absolute inset-y-0 rounded border-2 border-white/70"
        style={{ left: `${pct(viewportStart)}%`, width: `${pct(zoom)}%` }}
      />
    </div>
  )
}
