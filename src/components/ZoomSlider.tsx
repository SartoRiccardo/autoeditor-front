import { MIN_ZOOM_SECONDS, clamp } from '../lib/timeline'

interface Props {
  duration: number
  zoom: number
  viewportStart: number
  onChange: (viewportStart: number, zoom: number) => void
}

export default function ZoomSlider({ duration, zoom, viewportStart, onChange }: Props) {
  const min = Math.min(MIN_ZOOM_SECONDS, duration || MIN_ZOOM_SECONDS)
  const max = duration || MIN_ZOOM_SECONDS

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = clamp(Number(e.target.value), min, max)
    const center = viewportStart + zoom / 2
    const newStart = clamp(center - newZoom / 2, 0, Math.max(0, duration - newZoom))
    onChange(newStart, newZoom)
  }

  return (
    <div className="flex items-center gap-2 px-1">
      <span className="text-xs text-neutral-500">zoom</span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.1}
        value={clamp(zoom, min, max)}
        onChange={handleChange}
        className="h-1 flex-1 accent-neutral-100"
      />
    </div>
  )
}
