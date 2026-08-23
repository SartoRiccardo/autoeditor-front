import { useCallback, useMemo, useRef } from 'react'
import { clamp, pickTickInterval } from '../lib/timeline'

export type CursorMode = 'seek' | 'pan'

interface Props {
  mode: CursorMode
  duration: number
  viewportStart: number
  zoom: number
  playhead: number
  onSeek: (time: number) => void
  onPan: (viewportStart: number) => void
}

export default function CursorTimeline({ mode, duration, viewportStart, zoom, playhead, onSeek, onPan }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const panStart = useRef({ clientX: 0, viewportStart: 0, width: 1 })

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

  const handleSeekMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current) return
      onSeek(timeAtClientX(e.clientX))
    },
    [onSeek, timeAtClientX],
  )

  const handlePanMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current) return
      // swipe right -> content slides right -> earlier footage comes into view,
      // same feel as scrolling a phone screen with your finger
      const deltaPx = e.clientX - panStart.current.clientX
      const deltaTime = -(deltaPx / panStart.current.width) * zoom
      onPan(clamp(panStart.current.viewportStart + deltaTime, 0, Math.max(0, duration - zoom)))
    },
    [duration, onPan, zoom],
  )

  const stopDragging = useCallback(() => {
    dragging.current = false
    window.removeEventListener('pointermove', handleSeekMove)
    window.removeEventListener('pointermove', handlePanMove)
    window.removeEventListener('pointerup', stopDragging)
  }, [handlePanMove, handleSeekMove])

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    dragging.current = true
    if (mode === 'seek') {
      onSeek(timeAtClientX(e.clientX))
      window.addEventListener('pointermove', handleSeekMove)
    } else {
      const rect = trackRef.current?.getBoundingClientRect()
      panStart.current = { clientX: e.clientX, viewportStart, width: rect?.width || 1 }
      window.addEventListener('pointermove', handlePanMove)
    }
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
        className={`relative h-8 w-full touch-none rounded-lg bg-neutral-900 ${mode === 'pan' ? 'cursor-grab active:cursor-grabbing' : ''}`}
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
