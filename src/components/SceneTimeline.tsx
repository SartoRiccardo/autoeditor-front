import { sceneColor } from "../lib/timeline";
import type { Clip, Scene } from "../lib/types";

interface Props {
  scenes: Scene[];
  clips: Clip[];
  selectedClipId: number | null;
  viewportStart: number;
  zoom: number;
  onSelectClip: (id: number) => void;
}

function clipBorderColor(clip: Clip) {
  if (!clip.viewed) return "border-neutral-400";
  return clip.usable ? "border-emerald-500" : "border-red-500";
}

export default function SceneTimeline({
  scenes,
  clips,
  selectedClipId,
  viewportStart,
  zoom,
  onSelectClip,
}: Props) {
  const pct = (t: number) => (zoom > 0 ? ((t - viewportStart) / zoom) * 100 : 0);

  return (
    <div className="relative h-8 w-full select-none overflow-hidden rounded-lg bg-neutral-900">
      {scenes.map((scene, i) => (
        <div
          key={scene.id}
          className={`absolute inset-y-0 ${sceneColor(i)}`}
          style={{
            left: `${pct(scene.start)}%`,
            width: `${pct(scene.end) - pct(scene.start)}%`,
          }}
          title={scene.label}
        />
      ))}

      {clips.map((clip) => (
        <button
          key={clip.id}
          type="button"
          onClick={() => onSelectClip(clip.id)}
          className={`absolute inset-y-0 origin-center scale-y-110 rounded-sm border-x-[5px] border-y bg-transparent ${clipBorderColor(
            clip,
          )} ${clip.id === selectedClipId ? "outline outline-2 outline-white outline-offset-1" : ""}`}
          style={{
            left: `${pct(clip.start)}%`,
            width: `${Math.max(pct(clip.end) - pct(clip.start), 0.6)}%`,
          }}
        />
      ))}
    </div>
  );
}
