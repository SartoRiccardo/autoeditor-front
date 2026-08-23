import { Check, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react'

interface Props {
  playing: boolean
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
  onAccept: () => void
  onReject: () => void
  usable: boolean | null
  disabled?: boolean
}

export default function EditorControls({
  playing,
  onTogglePlay,
  onPrev,
  onNext,
  onAccept,
  onReject,
  usable,
  disabled,
}: Props) {
  const btn = 'flex h-11 w-11 items-center justify-center rounded-full bg-neutral-800 text-neutral-100 disabled:opacity-30'

  return (
    <div className="flex items-center justify-center gap-3">
      <button type="button" className={btn} onClick={onPrev} disabled={disabled}>
        <SkipBack size={18} />
      </button>
      <button type="button" className={btn} onClick={onTogglePlay} disabled={disabled}>
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <button type="button" className={btn} onClick={onNext} disabled={disabled}>
        <SkipForward size={18} />
      </button>
      <button
        type="button"
        onClick={onReject}
        disabled={disabled}
        className={`flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-30 ${
          usable === false ? 'bg-red-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
        }`}
      >
        <X size={18} />
      </button>
      <button
        type="button"
        onClick={onAccept}
        disabled={disabled}
        className={`flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-30 ${
          usable === true ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
        }`}
      >
        <Check size={18} />
      </button>
    </div>
  )
}
