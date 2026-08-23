import * as Slider from '@radix-ui/react-slider'
import { ZoomIn } from 'lucide-react'
import { MIN_ZOOM_SECONDS, clamp } from '../lib/timeline'

interface Props {
  duration: number
  zoom: number
  viewportStart: number
  onChange: (viewportStart: number, zoom: number) => void
}

const LEVEL_MAX = 100

// slider position is a 0-100 "zoom level", not the raw window size: 0 = fully
// zoomed out (window = whole duration), 100 = fully zoomed in (window = MIN_ZOOM_SECONDS)
function levelToZoom(level: number, duration: number) {
  const max = duration || MIN_ZOOM_SECONDS
  const min = Math.min(MIN_ZOOM_SECONDS, max)
  return max - (level / LEVEL_MAX) * (max - min)
}

function zoomToLevel(zoomSeconds: number, duration: number) {
  const max = duration || MIN_ZOOM_SECONDS
  const min = Math.min(MIN_ZOOM_SECONDS, max)
  if (max === min) return 0
  return clamp(((max - zoomSeconds) / (max - min)) * LEVEL_MAX, 0, LEVEL_MAX)
}

export default function ZoomSlider({ duration, zoom, viewportStart, onChange }: Props) {
  const handleChange = ([level]: number[]) => {
    const newZoom = levelToZoom(level, duration)
    const center = viewportStart + zoom / 2
    const newStart = clamp(center - newZoom / 2, 0, Math.max(0, duration - newZoom))
    onChange(newStart, newZoom)
  }

  return (
    <div className="ml-auto flex w-40 items-center gap-2 py-3">
      <ZoomIn size={15} className="shrink-0 text-neutral-500" />
      <Slider.Root
        className="relative flex h-5 flex-1 touch-none select-none items-center"
        min={0}
        max={LEVEL_MAX}
        step={0.5}
        value={[zoomToLevel(zoom, duration)]}
        onValueChange={handleChange}
      >
        <Slider.Track className="relative h-1 flex-1 rounded-full bg-neutral-800">
          <Slider.Range className="absolute h-full rounded-full bg-neutral-400" />
        </Slider.Track>
        <Slider.Thumb className="block h-4 w-4 rounded-full bg-neutral-100 shadow-sm transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50" />
      </Slider.Root>
    </div>
  )
}
