import React, { useEffect, useState, useRef } from "react";
import * as types from "./types";
import { cssVarHsla } from "../../lib/css.ts";
import { match } from "ts-pattern";
import { PlayState } from "@/types/timeline.tsx";
import * as timeline from "@/types/timeline.tsx";

interface CanvasProps {
  canvasData: types.Canvas;
  timelineState: timeline.Timeline;
  setTimelineState: React.Dispatch<timeline.Timeline>;
}

type Dimensions = {
  width: number;
  height: number;
};

const drawAxisLines = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  ratio: number,
) => {
  const strokeStyle = cssVarHsla("--border");

  // Draw X-axis
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2 / ratio);
  ctx.lineTo(canvas.width / ratio, canvas.height / 2 / ratio);
  if (strokeStyle) ctx.strokeStyle = strokeStyle;
  ctx.stroke();

  // Draw Y-axis
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 / ratio, 0);
  ctx.lineTo(canvas.width / 2 / ratio, canvas.height / ratio);
  if (strokeStyle) ctx.strokeStyle = strokeStyle;
  ctx.stroke();
};

const updateCanvas = (
  canvas: HTMLCanvasElement,
  entities: types.Entity[],
  dimensions: Dimensions,
) => {
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const ratio = window.devicePixelRatio || 1;

    canvas.width = dimensions.width * ratio;
    canvas.height = dimensions.height * ratio;

    ctx.scale(ratio, ratio);

    const centerX = canvas.width / 2 / ratio;
    const centerY = canvas.height / 2 / ratio;

    // Clear the initial rectangle
    ctx.fillStyle = cssVarHsla("--muted") || "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawAxisLines(ctx, canvas, ratio);

    entities.map((entity) => {
      const cX = centerX - entity.width / ratio / 2;
      const cY = centerY - entity.height / ratio / 2;
      const x = cX + entity.x / ratio / 2;
      const y = cY + entity.y / ratio / 2;

      ctx.save();
      ctx.translate(
        x + entity.width / ratio / 2,
        y + entity.height / ratio / 2,
      );
      const radians = (entity.rotation * Math.PI) / 180;
      ctx.rotate(radians);
      ctx.translate(
        -(x + entity.width / ratio / 2),
        -(y + entity.height / ratio / 2),
      );

      ctx.fillStyle = entity.color;
      ctx.fillRect(x, y, entity.width / ratio, entity.height / ratio); // Adjusted for HDPI screens

      ctx.restore();
    });
  }
};

const useCanvas = function () {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      const canvasRef = ref.current;

      if (canvasRef) {
        const { offsetHeight: height, offsetWidth: width } = canvasRef;
        setDimensions({ width: width, height: height });
      }
    };

    updateDimensions();

    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  return { ref, dimensions };
};

function animateCanvasEntities({
  canvasData,
  canvasElement,
  dimensions,
  progressRef,
  requestAnimationFrameRef,
  setTimelineState,
  timelineState,
}: {
  canvasData: types.Canvas;
  canvasElement: HTMLCanvasElement;
  dimensions: Dimensions;
  progressRef: React.MutableRefObject<number | undefined>;
  requestAnimationFrameRef: React.MutableRefObject<number | undefined>;
  setTimelineState: React.Dispatch<timeline.Timeline>;
  timelineState: timeline.Timeline;
}): void {
  function draw() {
    const currentTime = performance.now();

    const elapsed = currentTime - timelineState.startTime;

    const progress = match(timelineState)
      .with({ playState: PlayState.Playing }, () => {
        const timelineProgress = timelineState.progress || 0;

        const playingProgress = Math.min(
          timelineProgress + elapsed / timelineState.duration / 1000,
          1,
        );
        progressRef.current = playingProgress;
        return playingProgress;
      })
      .with({ playState: PlayState.Paused }, () => {
        return (
          // Paused and stored timeline progress
          timelineState.progress ||
          // Progress before storing it in state using the mutable ref
          progressRef.current ||
          // Default state
          0
        );
      })
      .otherwise(() => 0);

    // Possibly mutate entities if the Object copy is too slow for an animation
    const entitiesAtProgress = canvasData.entities.map((entity) => ({
      ...entity,
      rotation: entity.rotation + 180 * progress,
    }));

    updateCanvas(canvasElement, entitiesAtProgress, dimensions);

    if (
      timeline.isPaused(timelineState) &&
      timelineState.progress === undefined
    ) {
      const animationFrameID: number = requestAnimationFrameRef.current!;
      cancelAnimationFrame(animationFrameID);
      progressRef.current = undefined;
      setTimelineState({
        ...timelineState,
        progress: progress,
      });
      return;
    }

    if (timeline.isPlaying(timelineState)) {
      if (progress === 1) {
        // Timeline finished playing, set it to paused a
        progressRef.current = undefined;
        setTimelineState(timeline.stop(timelineState));
      } else {
        requestAnimationFrameRef.current = requestAnimationFrame(draw);
      }
    }
  }

  requestAnimationFrameRef.current = requestAnimationFrame(draw);
}

const Canvas: React.FC<CanvasProps> = ({
  canvasData,
  timelineState,
  setTimelineState,
}) => {
  const { ref, dimensions } = useCanvas();
  const progressRef = useRef();
  const requestAnimationFrameRef = useRef();

  useEffect(() => {
    const canvasElement = ref.current;

    if (
      !timeline.isPlaying(timelineState) &&
      requestAnimationFrameRef.current
    ) {
      cancelAnimationFrame(requestAnimationFrameRef.current);
    }

    if (canvasElement && dimensions) {
      animateCanvasEntities({
        canvasElement,
        dimensions,
        canvasData,
        timelineState,
        progressRef,
        setTimelineState,
        requestAnimationFrameRef,
      });
    }
  }, [ref, dimensions, canvasData, timelineState, setTimelineState]);

  return <canvas ref={ref} id="canvas" className="w-full h-full"></canvas>;
};

export default Canvas;
