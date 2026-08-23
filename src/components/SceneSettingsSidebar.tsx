import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Clip, Scene } from '../lib/types'

interface Props {
  scene: Scene | null
  scenes: Scene[]
  clips: Clip[]
  readOnly: boolean
  saving: boolean
  onClose: () => void
  onSave: (patch: { label: string; description: string }) => void
  onDelete: () => void
  onSelectClip: (clipId: number) => void
  onReorder: (sceneIds: number[]) => void
}

export default function SceneSettingsSidebar({
  scene,
  scenes,
  clips,
  readOnly,
  saving,
  onClose,
  onSave,
  onDelete,
  onSelectClip,
  onReorder,
}: Props) {
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [clipsOpen, setClipsOpen] = useState(true)
  const [orderOpen, setOrderOpen] = useState(false)

  useEffect(() => {
    setLabel(scene?.label ?? '')
    setDescription(scene?.description ?? '')
  }, [scene])

  if (!scene) return null

  const sceneClips = clips.filter((c) => c.scene_id === scene.id)
  const orderedScenes = [...scenes].sort((a, b) => a.order - b.order)

  const moveScene = (index: number, offset: number) => {
    const target = index + offset
    if (target < 0 || target >= orderedScenes.length) return
    const ids = orderedScenes.map((s) => s.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    onReorder(ids)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-l border-white/10 bg-neutral-900 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-50">Scene settings</h2>
          <button onClick={onClose} aria-label="Close" className="text-neutral-400 hover:text-neutral-100">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6">
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">Name</label>
          <input
            value={label}
            disabled={readOnly}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-neutral-100 disabled:opacity-40"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">Description</label>
          <textarea
            value={description}
            disabled={readOnly}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg bg-neutral-800 px-3 py-2 text-sm text-neutral-100 disabled:opacity-40"
          />
        </div>

        <button
          onClick={() => onSave({ label, description })}
          disabled={readOnly || saving || !label.trim()}
          className="mt-3 w-full rounded-full bg-neutral-100 py-2 text-sm font-medium text-neutral-900 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>

        <div className="mt-6 border-t border-white/10 pt-4">
          <button
            onClick={() => setClipsOpen((v) => !v)}
            className="flex w-full items-center justify-between text-xs font-medium text-neutral-400"
          >
            <span>Clips in this scene ({sceneClips.length})</span>
            {clipsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {clipsOpen && (
            <ul className="mt-2 space-y-1">
              {sceneClips.length === 0 && <li className="text-xs text-neutral-500">No clips yet.</li>}
              {sceneClips.map((clip) => (
                <li key={clip.id}>
                  <button
                    onClick={() => onSelectClip(clip.id)}
                    className="w-full truncate rounded-lg bg-neutral-800 px-3 py-2 text-left text-sm text-neutral-100 hover:bg-neutral-700"
                  >
                    {clip.take_label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <button
            onClick={() => setOrderOpen((v) => !v)}
            className="flex w-full items-center justify-between text-xs font-medium text-neutral-400"
          >
            <span>Scene order</span>
            {orderOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {orderOpen && (
            <ul className="mt-2 space-y-1">
              {orderedScenes.map((s, i) => (
                <li key={s.id} className="flex items-center gap-2 rounded-lg bg-neutral-800 px-3 py-2">
                  <span className={`min-w-0 flex-1 truncate text-sm ${s.id === scene.id ? 'text-amber-400' : 'text-neutral-100'}`}>
                    {s.label}
                  </span>
                  <button
                    onClick={() => moveScene(i, -1)}
                    disabled={readOnly || i === 0}
                    aria-label="Move up"
                    className="text-neutral-400 disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => moveScene(i, 1)}
                    disabled={readOnly || i === orderedScenes.length - 1}
                    aria-label="Move down"
                    className="text-neutral-400 disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={onDelete}
          disabled={readOnly || sceneClips.length > 0}
          title={sceneClips.length > 0 ? 'Move or delete its clips first' : undefined}
          className="mt-auto w-full rounded-full bg-red-500 py-2.5 text-sm font-medium text-neutral-950 disabled:opacity-40"
        >
          Delete scene
        </button>
      </div>
    </div>
  )
}
