import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useMemo, useRef } from 'react'
import { clamp, pickTickInterval } from '../lib/timeline'
import type { Scene } from '../lib/types'

interface Props {
  selectedScene: Scene | null
  scenes: Scene[]
  duration: number
  viewportStart: number
  zoom: number
  onTrim: (start: number, end: number) => void
  onPan: (viewportStart: number) => void
  pickMode?: boolean
  pendingStart?: number | null
  onPick?: (time: number) => void
}

type DragTarget = 'start' | 'end' | null

const MIN_SCENE_DURATION = 0.05

export default function SceneEditStrip({
  selectedScene,
  scenes,
  duration,
  viewportStart,
  zoom,
  onTrim,
  onPan,
  pickMode,
  pendingStart,
  onPick,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<DragTarget>(null)
  // neighbor bounds are captured once at drag-start, since the dragged scene's
  // own boundary shouldn't feed back into where its neighbors are
  const dragBounds = useRef({ minStart: 0, maxEnd: duration })

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
      if (!dragging.current || !selectedScene) return
      const t = timeAtClientX(e.clientX)
      const { minStart, maxEnd } = dragBounds.current
      if (dragging.current === 'start') {
        onTrim(clamp(t, minStart, selectedScene.end - MIN_SCENE_DURATION), selectedScene.end)
      } else {
        onTrim(selectedScene.start, clamp(t, selectedScene.start + MIN_SCENE_DURATION, maxEnd))
      }
    },
    [selectedScene, onTrim, timeAtClientX],
  )

  const stopDragging = useCallback(() => {
    dragging.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', stopDragging)
  }, [handlePointerMove])

  const startDragging = (target: DragTarget) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selectedScene) return
    dragging.current = target

    // scenes never overlap by design, so the immediate neighbor by position is
    // exactly the wall this boundary can't cross
    const placed = scenes
      .filter((s) => s.id !== selectedScene.id && s.end > s.start)
      .sort((a, b) => a.start - b.start)
    const prev = [...placed].reverse().find((s) => s.end <= selectedScene.start)
    const next = placed.find((s) => s.start >= selectedScene.end)
    dragBounds.current = { minStart: prev ? prev.end : 0, maxEnd: next ? next.start : duration }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
  }

  const pct = (t: number) => (zoom > 0 ? ((t - viewportStart) / zoom) * 100 : 0)

  const startVisible = selectedScene ? selectedScene.start >= viewportStart && selectedScene.start <= windowEnd : false
  const endVisible = selectedScene ? selectedScene.end >= viewportStart && selectedScene.end <= windowEnd : false

  const ticks = useMemo(() => {
    if (zoom <= 0) return []
    const interval = pickTickInterval(zoom)
    const first = Math.ceil(viewportStart / interval) * interval
    const result: number[] = []
    for (let t = first; t <= windowEnd + 1e-6; t += interval) result.push(t)
    return result
  }, [viewportStart, windowEnd, zoom])

  return (
    <div className="select-none px-0 pt-4">
      <div
        ref={trackRef}
        className={`relative h-8 w-full touch-none rounded-lg bg-neutral-900 ${pickMode ? 'cursor-crosshair' : ''}`}
        onPointerDown={pickMode ? (e) => onPick?.(timeAtClientX(e.clientX)) : undefined}
      >
        {ticks.map((t) => (
          <div key={t} className="pointer-events-none absolute inset-y-0 w-px bg-white/10" style={{ left: `${pct(t)}%` }} />
        ))}

        {pickMode && pendingStart != null && pendingStart >= viewportStart && pendingStart <= windowEnd && (
          <div
            className="pointer-events-none absolute inset-y-0 w-0.5 bg-amber-400"
            style={{ left: `${pct(pendingStart)}%` }}
          />
        )}

        {selectedScene && (
          <div
            className="pointer-events-none absolute inset-y-0 origin-center scale-y-110 rounded-sm border-x-[5px] border-y border-amber-400 bg-transparent"
            style={{
              left: `${pct(Math.max(selectedScene.start, viewportStart))}%`,
              width: `${pct(Math.min(selectedScene.end, windowEnd)) - pct(Math.max(selectedScene.start, viewportStart))}%`,
            }}
          />
        )}

        {selectedScene && startVisible && (
          <div
            onPointerDown={startDragging('start')}
            className="absolute inset-y-0 z-10 w-8 -translate-x-1/2 touch-none cursor-ew-resize"
            style={{ left: `${pct(selectedScene.start)}%` }}
          />
        )}
        {selectedScene && endVisible && (
          <div
            onPointerDown={startDragging('end')}
            className="absolute inset-y-0 z-10 w-8 -translate-x-1/2 touch-none cursor-ew-resize"
            style={{ left: `${pct(selectedScene.end)}%` }}
          />
        )}

        {selectedScene && !startVisible && selectedScene.start < viewportStart && (
          <button
            type="button"
            onClick={() => onPan(Math.max(0, selectedScene.start - zoom / 2))}
            className="absolute inset-y-0 left-0 z-10 flex items-center rounded-l-2xl bg-amber-400/80 px-0.5"
          >
            <ChevronLeft size={16} className="text-neutral-950" />
          </button>
        )}
        {selectedScene && !endVisible && selectedScene.end > windowEnd && (
          <button
            type="button"
            onClick={() => onPan(Math.max(0, selectedScene.end - zoom / 2))}
            className="absolute inset-y-0 right-0 z-10 flex items-center rounded-r-2xl bg-amber-400/80 px-0.5"
          >
            <ChevronRight size={16} className="text-neutral-950" />
          </button>
        )}
      </div>
    </div>
  )
}
