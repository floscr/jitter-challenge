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

// Hardcoded rotation angle for the animation, this would be replaced by custom keyframes in a real product
const ROTATE_BY_DEFAULT = 360;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

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

    const linearProgress = match(timelineState)
      .with({ playState: PlayState.Playing }, () => {
        const linearProgress = Math.min(
          (timelineState.progress || 0) +
            elapsed / timelineState.duration / 1000,
          1,
        );
        progressRef.current = linearProgress;

        return linearProgress;
      })
      .with({ playState: PlayState.Paused }, () => {
        return timelineState.progress || progressRef.current || 0;
      })
      .otherwise(() => 0);

    const easedProgress = easeInOutCubic(linearProgress);

    // Possibly mutate entities if the Object copy is too slow for an animation
    const entitiesAtProgress = canvasData.entities.map((entity) => ({
      ...entity,
      rotation: entity.rotation + ROTATE_BY_DEFAULT * easedProgress,
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

      setTimelineState({
        ...timelineState,
        progress: linearProgress,
      });
      progressRef.current = undefined;

      return;
    }

    // Play animation until end has reached
    if (timeline.isPlaying(timelineState)) {
      if (easedProgress === 1) {
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

      const { ratio } = canvasData.dimensions!;
      const canvasElement = ref.current!;

      if (!canvasElement) return;

      const rect = canvasElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const clickX = (e.clientX - centerX) * ratio;
      const clickY = (e.clientY - centerY) * ratio;

      const clickedEntity = findLast((entity: canvas.Entity) => {
        const entityCenterX = entity.x;
        const entityCenterY = entity.y;

        const angleInRadians = (-entity.rotation * Math.PI) / 180;
        const rotatedX =
          Math.cos(angleInRadians) * (clickX - entityCenterX) -
          Math.sin(angleInRadians) * (clickY - entityCenterY) +
          entityCenterX;
        const rotatedY =
          Math.sin(angleInRadians) * (clickX - entityCenterX) +
          Math.cos(angleInRadians) * (clickY - entityCenterY) +
          entityCenterY;

        const halfWidth = entity.width / 2;
        const halfHeight = entity.height / 2;
        const isWithinBounds =
          rotatedX >= entityCenterX - halfWidth &&
          rotatedX <= entityCenterX + halfWidth &&
          rotatedY >= entityCenterY - halfHeight &&
          rotatedY <= entityCenterY + halfHeight;

        return isWithinBounds;
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
      className="w-full h-full select-none"
      onClick={onCanvasClick}
    />
  );
};

export default Canvas;
