import { useCallback, useRef } from 'react'
import { clamp } from '../lib/timeline'

interface Props {
  duration: number
  zoom: number
  viewportStart: number
  onChange: (viewportStart: number) => void
}

export default function TimelineScrollbar({ duration, zoom, viewportStart, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef(0)

  const widthPct = duration > 0 ? Math.min(100, (zoom / duration) * 100) : 100
  const leftPct = duration > 0 ? (viewportStart / duration) * 100 : 0

  const startAtClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track || duration <= 0) return 0
      const rect = track.getBoundingClientRect()
      const ratio = (clientX - rect.left - dragOffset.current) / rect.width
      return clamp(ratio * duration, 0, Math.max(0, duration - zoom))
    },
    [duration, zoom],
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      onChange(startAtClientX(e.clientX))
    },
    [onChange, startAtClientX],
  )

  const stopDragging = useCallback(() => {
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', stopDragging)
  }, [handlePointerMove])

  const onThumbPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    dragOffset.current = e.clientX - rect.left
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
  }

  const onTrackPointerDown = (e: React.PointerEvent) => {
    dragOffset.current = 0
    onChange(startAtClientX(e.clientX))
  }

  return (
    <div
      ref={trackRef}
      onPointerDown={onTrackPointerDown}
      className="relative h-2.5 w-full touch-none rounded-full bg-neutral-900"
    >
      <div
        onPointerDown={onThumbPointerDown}
        className="absolute inset-y-0 touch-none rounded-full bg-neutral-500 transition-colors hover:bg-neutral-400"
        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
      />
    </div>
  )
}
