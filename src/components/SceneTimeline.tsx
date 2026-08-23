import { useRef } from "react";
import { sceneColor } from "../lib/timeline";
import type { Clip, Scene } from "../lib/types";

interface Props {
  scenes: Scene[];
  clips: Clip[];
  selectedClipId: number | null;
  viewportStart: number;
  zoom: number;
  onSelectClip: (id: number) => void;
  onLongPressClip: (id: number) => void;
}

const LONG_PRESS_MS = 450;
const MOVE_CANCEL_PX = 8;

function clipBorderColor(clip: Clip) {
  if (!clip.viewed) return "border-neutral-400";
  return clip.usable ? "border-emerald-500" : "border-red-500";
}

interface ClipMarkerProps {
  clip: Clip;
  selected: boolean;
  left: number;
  width: number;
  onSelect: () => void;
  onLongPress: () => void;
}

function ClipMarker({ clip, selected, left, width, onSelect, onLongPress }: ClipMarkerProps) {
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
      className={`absolute inset-y-0 origin-center scale-y-110 touch-none rounded-sm border-x-[5px] border-y bg-transparent ${clipBorderColor(
        clip,
      )} ${selected ? "outline outline-2 outline-white outline-offset-1" : ""}`}
      style={{ left: `${left}%`, width: `${width}%` }}
    />
  );
}

export default function SceneTimeline({
  scenes,
  clips,
  selectedClipId,
  viewportStart,
  zoom,
  onSelectClip,
  onLongPressClip,
}: Props) {
  const windowEnd = viewportStart + zoom;
  const pct = (t: number) => (zoom > 0 ? ((t - viewportStart) / zoom) * 100 : 0);

  return (
    <div className="relative h-8 w-full select-none rounded-lg bg-neutral-900">
      <div className="absolute inset-0 overflow-hidden rounded-lg">
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
      </div>

      {clips
        .filter((clip) => clip.end >= viewportStart && clip.start <= windowEnd)
        .map((clip) => {
          // clamp to the visible window ourselves (rather than clipping the whole
          // track with overflow-hidden) so the border's scale-y-110 can still poke
          // past the top/bottom edges the way the design calls for
          const left = Math.max(clip.start, viewportStart);
          const right = Math.min(clip.end, windowEnd);
          return (
            <ClipMarker
              key={clip.id}
              clip={clip}
              selected={clip.id === selectedClipId}
              left={pct(left)}
              width={Math.max(pct(right) - pct(left), 0.6)}
              onSelect={() => onSelectClip(clip.id)}
              onLongPress={() => onLongPressClip(clip.id)}
            />
          );
        })}
    </div>
  );
}
