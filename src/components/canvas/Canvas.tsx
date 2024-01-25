import React, { useEffect, useRef, useCallback } from "react";
import { findLast } from "ramda";
import { match } from "ts-pattern";

import * as canvas from "@/lib/canvas";
import * as timeline from "@/lib/timeline";
import { PlayState } from "@/lib/timeline";
import { cssVarHsla } from "@/lib/css";

// Types ----------------------------------------------------------------------

type Dimensions = {
  ratio: number;
  width: number;
  height: number;
};

// Canvas Context Drawing ------------------------------------------------------

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
  entities: canvas.Entity[],
  dimensions: Dimensions,
) => {
  const { ratio } = dimensions;

  canvas.width = dimensions.width * ratio;
  canvas.height = dimensions.height * ratio;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.scale(ratio, ratio);

  const canvasCenterX = canvas.width / 2 / ratio;
  const canvasCenterY = canvas.height / 2 / ratio;

  // Clear the initial rectangle
  ctx.fillStyle = cssVarHsla("--muted") || "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawAxisLines(ctx, canvas, ratio);

  entities.map((entity) => {
    const width = entity.width / ratio;
    const height = entity.height / ratio;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const cX = canvasCenterX - halfWidth;
    const cY = canvasCenterY - halfHeight;
    const x = cX + entity.x / ratio;
    const y = cY + entity.y / ratio;

    // Rotate the shape
    ctx.save();
    ctx.translate(x + halfWidth, y + halfHeight);
    const radians = (entity.rotation * Math.PI) / 180;
    ctx.rotate(radians);
    ctx.translate(-(x + halfWidth), -(y + halfHeight));

    ctx.fillStyle = entity.color;
    ctx.fillRect(x, y, width, height);

    ctx.restore();
  });
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
  canvasData: canvas.Canvas;
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
          // Progress before storing it in state using the ref value
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

    // Timeline was paused from the outside
    // Stop animation & commit progress to the state
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

    // Play animation until end has reached
    if (timeline.isPlaying(timelineState)) {
      if (progress === 1) {
        // Timeline finished playing
        progressRef.current = undefined;
        setTimelineState(timeline.stop(timelineState));
      } else {
        requestAnimationFrameRef.current = requestAnimationFrame(draw);
      }
    }
  }

  requestAnimationFrameRef.current = requestAnimationFrame(draw);
}

// Hooks -----------------------------------------------------------------------

const useCanvas = function (
  setCanvasData: React.Dispatch<React.SetStateAction<canvas.Canvas>>,
) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      const canvasRef = ref.current;

      if (canvasRef) {
        const { offsetHeight: height, offsetWidth: width } = canvasRef;
        const ratio = window.devicePixelRatio || 1;

        setCanvasData((value: canvas.Canvas) => ({
          ...value,
          dimensions: {
            ratio,
            width,
            height,
          },
        }));
      }
    };

    updateDimensions();

    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [setCanvasData]);

  return { ref };
};

// Component -------------------------------------------------------------------

interface CanvasProps {
  canvasData: canvas.Canvas;
  timelineState: timeline.Timeline;
  setTimelineState: React.Dispatch<timeline.Timeline>;
  setCanvasData: React.Dispatch<React.SetStateAction<canvas.Canvas>>;
  onRandomizeRectangleColor: (id: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  canvasData,
  setCanvasData,
  timelineState,
  setTimelineState,
  onRandomizeRectangleColor,
}) => {
  const { ref } = useCanvas(setCanvasData);
  const { dimensions } = canvasData;

  const progressRef = useRef();
  const requestAnimationFrameRef = useRef();

  useEffect(() => {
    const canvasElement = ref.current;

    // Make sure animation is stopped when the state is update from the outside
    // E.g.: Updating the duration
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

  const onCanvasClick = useCallback(
    function (e: React.MouseEvent<HTMLCanvasElement>) {
      e.stopPropagation();

      const canvasElement = ref.current!;

      if (!canvasElement) return;

      const rect = canvasElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const clickX = e.clientX - centerX;
      const clickY = e.clientY - centerY;

      const clickedEntity = findLast((entity: canvas.Entity) => {
        return (
          clickX >= (entity.x - entity.width / 2) / devicePixelRatio &&
          clickX <= (entity.x + entity.width / 2) / devicePixelRatio &&
          clickY >= (entity.y - entity.height / 2) / devicePixelRatio &&
          clickY <= (entity.y + entity.height / 2) / devicePixelRatio
        );
      }, canvasData.entities);

      if (clickedEntity) {
        onRandomizeRectangleColor(clickedEntity.id);
      }
    },
    [canvasData, onRandomizeRectangleColor, ref],
  );

  return (
    <canvas
      ref={ref}
      id="canvas"
      className="w-full h-full"
      onClick={onCanvasClick}
    />
  );
};

export default Canvas;
