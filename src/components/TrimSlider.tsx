import { useCallback, useRef } from 'react'

interface Props {
  duration: number
  start: number
  end: number
  playhead: number
  onChange: (start: number, end: number) => void
  onSeek: (time: number) => void
}

type DragTarget = 'start' | 'end' | 'scrub' | null

export default function TrimSlider({ duration, start, end, playhead, onChange, onSeek }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<DragTarget>(null)

  const timeAtClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track || duration <= 0) return 0
      const rect = track.getBoundingClientRect()
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      return ratio * duration
    },
    [duration],
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current) return
      const t = timeAtClientX(e.clientX)
      if (dragging.current === 'start') {
        onChange(Math.min(t, end - 0.05), end)
      } else if (dragging.current === 'end') {
        onChange(start, Math.max(t, start + 0.05))
      } else {
        onSeek(t)
      }
    },
    [start, end, onChange, onSeek, timeAtClientX],
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

  const pct = (t: number) => (duration > 0 ? (t / duration) * 100 : 0)

  return (
    <div className="select-none px-1 py-4">
      <div
        ref={trackRef}
        className="relative h-12 w-full touch-none rounded-lg bg-neutral-800"
        onPointerDown={startDragging('scrub')}
      >
        {/* dimmed regions outside selection */}
        <div
          className="absolute inset-y-0 left-0 rounded-l-lg bg-black/60"
          style={{ width: `${pct(start)}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 rounded-r-lg bg-black/60"
          style={{ width: `${100 - pct(end)}%` }}
        />

        {/* playhead */}
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
          style={{ left: `${pct(playhead)}%` }}
        />

        {/* start handle */}
        <div
          onPointerDown={startDragging('start')}
          className="absolute inset-y-0 z-10 flex w-7 -translate-x-1/2 touch-none cursor-ew-resize items-center justify-center"
          style={{ left: `${pct(start)}%` }}
        >
          <div className="h-full w-3 rounded-full bg-amber-400" />
        </div>

        {/* end handle */}
        <div
          onPointerDown={startDragging('end')}
          className="absolute inset-y-0 z-10 flex w-7 -translate-x-1/2 touch-none cursor-ew-resize items-center justify-center"
          style={{ left: `${pct(end)}%` }}
        >
          <div className="h-full w-3 rounded-full bg-amber-400" />
        </div>
      </div>
      <div className="mt-1 flex justify-between text-xs text-neutral-500">
        <span>{start.toFixed(2)}s</span>
        <span>{end.toFixed(2)}s</span>
      </div>
    </div>
  )
}
