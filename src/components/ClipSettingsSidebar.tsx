import { X } from 'lucide-react'
import type { Clip, Scene } from '../lib/types'

interface Props {
  clip: Clip | null
  scenes: Scene[]
  readOnly: boolean
  onClose: () => void
  onMoveScene: (sceneId: number) => void
  onDelete: () => void
}

export default function ClipSettingsSidebar({ clip, scenes, readOnly, onClose, onMoveScene, onDelete }: Props) {
  if (!clip) return null

  const orderedScenes = [...scenes].sort((a, b) => a.order - b.order)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-72 max-w-[85vw] flex-col border-l border-white/10 bg-neutral-900 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-50">Clip settings</h2>
          <button onClick={onClose} aria-label="Close" className="text-neutral-400 hover:text-neutral-100">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6">
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">Scene</label>
          <select
            value={clip.scene_id}
            disabled={readOnly}
            onChange={(e) => onMoveScene(Number(e.target.value))}
            className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-neutral-100 disabled:opacity-40"
          >
            {orderedScenes.map((s, i) => (
              <option key={s.id} value={s.id}>{`${i + 1}: ${s.label}`}</option>
            ))}
          </select>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-neutral-400">Origin</span>
          <span className="text-neutral-100">{clip.source === 'agent' ? 'Uploaded' : 'Created'}</span>
        </div>

        {clip.source === 'user' && (
          <button
            onClick={onDelete}
            disabled={readOnly}
            className="mt-auto w-full rounded-full bg-red-500 py-2.5 text-sm font-medium text-neutral-950 disabled:opacity-40"
          >
            Delete clip
          </button>
        )}
      </div>
    </div>
  )
}
