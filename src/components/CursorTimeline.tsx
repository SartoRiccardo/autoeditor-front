import { useCallback, useMemo, useRef } from 'react'
import { pickTickInterval } from '../lib/timeline'

interface Props {
  viewportStart: number
  zoom: number
  playhead: number
  onSeek: (time: number) => void
}

export default function CursorTimeline({ viewportStart, zoom, playhead, onSeek }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

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
      if (!dragging.current) return
      onSeek(timeAtClientX(e.clientX))
    },
    [onSeek, timeAtClientX],
  )

  const stopDragging = useCallback(() => {
    dragging.current = false
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', stopDragging)
  }, [handlePointerMove])

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    dragging.current = true
    onSeek(timeAtClientX(e.clientX))
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
  }

  const pct = (t: number) => (zoom > 0 ? ((t - viewportStart) / zoom) * 100 : 0)

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
        className="relative h-8 w-full touch-none rounded-lg bg-neutral-900"
        onPointerDown={onPointerDown}
      >
        {ticks.map((t) => (
          <div
            key={t}
            className="pointer-events-none absolute inset-y-0 w-px bg-white/10"
            style={{ left: `${pct(t)}%` }}
          />
        ))}

        {playhead >= viewportStart && playhead <= windowEnd && (
          <div
            className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
            style={{ left: `${pct(playhead)}%` }}
          />
        )}
      </div>
    </div>
  )
}
