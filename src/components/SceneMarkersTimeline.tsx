import { useRef } from "react";
import { sceneColor } from "../lib/timeline";
import type { Scene } from "../lib/types";

interface Props {
  scenes: Scene[];
  selectedSceneId: number | null;
  viewportStart: number;
  zoom: number;
  onSelectScene: (id: number) => void;
  onLongPressScene: (id: number) => void;
}

const LONG_PRESS_MS = 450;
const MOVE_CANCEL_PX = 8;

interface SceneMarkerProps {
  scene: Scene;
  colorIndex: number;
  selected: boolean;
  left: number;
  width: number;
  onSelect: () => void;
  onLongPress: () => void;
}

function SceneMarker({ scene, colorIndex, selected, left, width, onSelect, onLongPress }: SceneMarkerProps) {
  const timerRef = useRef<number | undefined>(undefined);
  const firedRef = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const clearTimer = () => {
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = undefined;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    firedRef.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      firedRef.current = true;
      onLongPress();
    }, LONG_PRESS_MS);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (
      Math.abs(e.clientX - startPos.current.x) > MOVE_CANCEL_PX ||
      Math.abs(e.clientY - startPos.current.y) > MOVE_CANCEL_PX
    ) {
      clearTimer();
    }
  };

  const onPointerUp = () => {
    clearTimer();
    if (!firedRef.current) onSelect();
  };

  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={clearTimer}
      onContextMenu={(e) => e.preventDefault()}
      title={scene.label}
      className={`absolute inset-y-0 origin-center scale-y-110 touch-none rounded-sm ${sceneColor(colorIndex)} ${
        selected ? "outline outline-2 outline-white outline-offset-1" : ""
      }`}
      style={{ left: `${left}%`, width: `${width}%` }}
    />
  );
}

export default function SceneMarkersTimeline({
  scenes,
  selectedSceneId,
  viewportStart,
  zoom,
  onSelectScene,
  onLongPressScene,
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
            <SceneMarker
              key={scene.id}
              scene={scene}
              colorIndex={i}
              selected={scene.id === selectedSceneId}
              left={pct(left)}
              width={Math.max(pct(right) - pct(left), 0.6)}
              onSelect={() => onSelectScene(scene.id)}
              onLongPress={() => onLongPressScene(scene.id)}
            />
          );
        })}
    </div>
  );
}
