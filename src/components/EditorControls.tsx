import { Check, Pause, Play, Plus, SkipBack, SkipForward, X } from 'lucide-react'

interface Props {
  playing: boolean
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
  onAccept: () => void
  onReject: () => void
  onAddClip: () => void
  usable: boolean | null
  disabled?: boolean
  addDisabled?: boolean
}

export default function EditorControls({
  playing,
  onTogglePlay,
  onPrev,
  onNext,
  onAccept,
  onReject,
  onAddClip,
  usable,
  disabled,
  addDisabled,
}: Props) {
  const btn = 'flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-100 disabled:opacity-30'

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <button type="button" className={btn} onClick={onPrev} disabled={disabled}>
          <SkipBack size={17} />
        </button>
        <button type="button" className={btn} onClick={onTogglePlay} disabled={disabled}>
          {playing ? <Pause size={17} /> : <Play size={17} />}
        </button>
        <button type="button" className={btn} onClick={onNext} disabled={disabled}>
          <SkipForward size={17} />
        </button>
      </div>

      <button type="button" className={btn} onClick={onAddClip} disabled={addDisabled ?? disabled}>
        <Plus size={17} />
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReject}
          disabled={disabled}
          className={`flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-30 ${
            usable === false ? 'bg-red-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
          }`}
        >
          <X size={17} />
        </button>
        <button
          type="button"
          onClick={onAccept}
          disabled={disabled}
          className={`flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-30 ${
            usable === true ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
          }`}
        >
          <Check size={17} />
        </button>
      </div>
    </div>
  )
}
