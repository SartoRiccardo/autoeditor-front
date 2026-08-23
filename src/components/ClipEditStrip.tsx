import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { sceneColor } from '../lib/timeline'
import type { Clip, Scene } from '../lib/types'

interface Props {
  scenes: Scene[]
  clips: Clip[]
  selectedClip: Clip | null
  viewportStart: number
  zoom: number
  playhead: number
  onTrim: (start: number, end: number) => void
  onSeek: (time: number) => void
  onPan: (viewportStart: number) => void
}

type DragTarget = 'start' | 'end' | 'scrub' | null

export default function ClipEditStrip({
  scenes,
  clips,
  selectedClip,
  viewportStart,
  zoom,
  playhead,
  onTrim,
  onSeek,
  onPan,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<DragTarget>(null)

  const windowEnd = viewportStart + zoom

  const timeAtClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track || zoom <= 0) return viewportStart
      const rect = track.getBoundingClientRect()
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      return viewportStart + ratio * zoom
    },
    [viewportStart, zoom],
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current || !selectedClip) return
      const t = timeAtClientX(e.clientX)
      if (dragging.current === 'start') {
        onTrim(Math.min(t, selectedClip.end - 0.05), selectedClip.end)
      } else if (dragging.current === 'end') {
        onTrim(selectedClip.start, Math.max(t, selectedClip.start + 0.05))
      } else {
        onSeek(t)
      }
    },
    [selectedClip, onTrim, onSeek, timeAtClientX],
  )

  const stopDragging = useCallback(() => {
    dragging.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', stopDragging)
  }, [handlePointerMove])

  const startDragging = (target: DragTarget) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging.current = target
    if (target === 'scrub') onSeek(timeAtClientX(e.clientX))
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
  }

  const pct = (t: number) => (zoom > 0 ? ((t - viewportStart) / zoom) * 100 : 0)

  const startVisible = selectedClip ? selectedClip.start >= viewportStart && selectedClip.start <= windowEnd : false
  const endVisible = selectedClip ? selectedClip.end >= viewportStart && selectedClip.end <= windowEnd : false

  return (
    <div className="select-none px-1 py-2">
      <div
        ref={trackRef}
        className="relative h-16 w-full touch-none overflow-hidden rounded-lg bg-neutral-800"
        onPointerDown={startDragging('scrub')}
      >
        {scenes
          .filter((s) => s.end >= viewportStart && s.start <= windowEnd)
          .map((scene) => {
            const idx = scenes.indexOf(scene)
            return (
              <div
                key={scene.id}
                className={`absolute inset-y-0 ${sceneColor(idx)}`}
                style={{ left: `${pct(Math.max(scene.start, viewportStart))}%`, width: `${pct(Math.min(scene.end, windowEnd)) - pct(Math.max(scene.start, viewportStart))}%` }}
              />
            )
          })}

        {clips
          .filter((c) => c.end >= viewportStart && c.start <= windowEnd)
          .map((clip) => (
            <div
              key={clip.id}
              className={`absolute bottom-2 top-1/2 rounded-sm ${
                !clip.viewed ? 'bg-neutral-500' : clip.usable ? 'bg-emerald-500/70' : 'bg-red-500/70'
              } ${clip.id === selectedClip?.id ? 'ring-2 ring-white' : ''}`}
              style={{
                left: `${pct(Math.max(clip.start, viewportStart))}%`,
                width: `${pct(Math.min(clip.end, windowEnd)) - pct(Math.max(clip.start, viewportStart))}%`,
              }}
            />
          ))}

        {/* playhead */}
        {playhead >= viewportStart && playhead <= windowEnd && (
          <div
            className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
            style={{ left: `${pct(playhead)}%` }}
          />
        )}

        {selectedClip && startVisible && (
          <div
            onPointerDown={startDragging('start')}
            className="absolute inset-y-0 z-10 flex w-7 -translate-x-1/2 touch-none cursor-ew-resize items-center justify-center"
            style={{ left: `${pct(selectedClip.start)}%` }}
          >
            <div className="h-full w-3 rounded-full bg-amber-400" />
          </div>
        )}
        {selectedClip && endVisible && (
          <div
            onPointerDown={startDragging('end')}
            className="absolute inset-y-0 z-10 flex w-7 -translate-x-1/2 touch-none cursor-ew-resize items-center justify-center"
            style={{ left: `${pct(selectedClip.end)}%` }}
          >
            <div className="h-full w-3 rounded-full bg-amber-400" />
          </div>
        )}

        {selectedClip && !startVisible && selectedClip.start < viewportStart && (
          <button
            type="button"
            onClick={() => onPan(Math.max(0, selectedClip.start - zoom / 2))}
            className="absolute inset-y-0 left-0 z-10 flex items-center bg-amber-400/80 px-0.5"
          >
            <ChevronLeft size={16} className="text-neutral-950" />
          </button>
        )}
        {selectedClip && !endVisible && selectedClip.end > windowEnd && (
          <button
            type="button"
            onClick={() => onPan(Math.max(0, selectedClip.end - zoom / 2))}
            className="absolute inset-y-0 right-0 z-10 flex items-center bg-amber-400/80 px-0.5"
          >
            <ChevronRight size={16} className="text-neutral-950" />
          </button>
        )}
      </div>
    </div>
  )
}
