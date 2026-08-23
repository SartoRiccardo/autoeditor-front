import { sceneColor } from "../lib/timeline";
import type { Scene } from "../lib/types";

interface Props {
  scenes: Scene[];
  selectedSceneId: number | null;
  viewportStart: number;
  zoom: number;
  onSelectScene: (id: number) => void;
}

export default function SceneMarkersTimeline({
  scenes,
  selectedSceneId,
  viewportStart,
  zoom,
  onSelectScene,
}: Props) {
  const windowEnd = viewportStart + zoom;
  const pct = (t: number) => (zoom > 0 ? ((t - viewportStart) / zoom) * 100 : 0);

  return (
    <div className="relative h-8 w-full select-none rounded-lg bg-neutral-900">
      {scenes
        .map((scene, i) => ({ scene, i }))
        .filter(({ scene }) => scene.end > scene.start && scene.end >= viewportStart && scene.start <= windowEnd)
        .map(({ scene, i }) => {
          const left = Math.max(scene.start, viewportStart);
          const right = Math.min(scene.end, windowEnd);
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => onSelectScene(scene.id)}
              title={scene.label}
              className={`absolute inset-y-0 origin-center scale-y-110 touch-none rounded-sm ${sceneColor(i)} ${
                scene.id === selectedSceneId ? "outline outline-2 outline-white outline-offset-1" : ""
              }`}
              style={{
                left: `${pct(left)}%`,
                width: `${Math.max(pct(right) - pct(left), 0.6)}%`,
              }}
            />
          );
        })}
    </div>
  );
}
