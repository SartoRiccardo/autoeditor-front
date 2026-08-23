import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useMemo, useRef } from 'react'
import { pickTickInterval } from '../lib/timeline'
import type { Clip } from '../lib/types'

interface Props {
  selectedClip: Clip | null
  viewportStart: number
  zoom: number
  onTrim: (start: number, end: number) => void
  onPan: (viewportStart: number) => void
}

type DragTarget = 'start' | 'end' | null

export default function ClipEditStrip({ selectedClip, viewportStart, zoom, onTrim, onPan }: Props) {
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
      } else {
        onTrim(selectedClip.start, Math.max(t, selectedClip.start + 0.05))
      }
    },
    [selectedClip, onTrim, timeAtClientX],
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
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
  }

  const pct = (t: number) => (zoom > 0 ? ((t - viewportStart) / zoom) * 100 : 0)

  const startVisible = selectedClip ? selectedClip.start >= viewportStart && selectedClip.start <= windowEnd : false
  const endVisible = selectedClip ? selectedClip.end >= viewportStart && selectedClip.end <= windowEnd : false

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
      <div ref={trackRef} className="relative h-8 w-full touch-none rounded-lg bg-neutral-900">
        {ticks.map((t) => (
          <div key={t} className="pointer-events-none absolute inset-y-0 w-px bg-white/10" style={{ left: `${pct(t)}%` }} />
        ))}

        {selectedClip && (
          <div
            className="pointer-events-none absolute inset-y-0 origin-center scale-y-110 rounded-sm border-x-[5px] border-y border-amber-400 bg-transparent"
            style={{
              left: `${pct(Math.max(selectedClip.start, viewportStart))}%`,
              width: `${pct(Math.min(selectedClip.end, windowEnd)) - pct(Math.max(selectedClip.start, viewportStart))}%`,
            }}
          />
        )}

        {selectedClip && startVisible && (
          <div
            onPointerDown={startDragging('start')}
            className="absolute inset-y-0 z-10 w-8 -translate-x-1/2 touch-none cursor-ew-resize"
            style={{ left: `${pct(selectedClip.start)}%` }}
          />
        )}
        {selectedClip && endVisible && (
          <div
            onPointerDown={startDragging('end')}
            className="absolute inset-y-0 z-10 w-8 -translate-x-1/2 touch-none cursor-ew-resize"
            style={{ left: `${pct(selectedClip.end)}%` }}
          />
        )}

        {selectedClip && !startVisible && selectedClip.start < viewportStart && (
          <button
            type="button"
            onClick={() => onPan(Math.max(0, selectedClip.start - zoom / 2))}
            className="absolute inset-y-0 left-0 z-10 flex items-center rounded-l-2xl bg-amber-400/80 px-0.5"
          >
            <ChevronLeft size={16} className="text-neutral-950" />
          </button>
        )}
        {selectedClip && !endVisible && selectedClip.end > windowEnd && (
          <button
            type="button"
            onClick={() => onPan(Math.max(0, selectedClip.end - zoom / 2))}
            className="absolute inset-y-0 right-0 z-10 flex items-center rounded-r-2xl bg-amber-400/80 px-0.5"
          >
            <ChevronRight size={16} className="text-neutral-950" />
          </button>
        )}
      </div>
    </div>
  )
}
