import React, { useEffect, useState, useRef } from "react";
import * as types from "./types";

interface CanvasProps {
  canvasData: types.Canvas;
  onClick: (index: number) => void;
}

const drawAxisLines = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  ratio: number,
) => {
  // Draw X-axis
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2 / ratio);
  ctx.lineTo(canvas.width / ratio, canvas.height / 2 / ratio);
  ctx.strokeStyle = "rgb(228, 228, 231)";
  ctx.stroke();

  // Draw Y-axis
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 / ratio, 0);
  ctx.lineTo(canvas.width / 2 / ratio, canvas.height / ratio);
  ctx.strokeStyle = "rgb(228, 228, 231)";
  ctx.stroke();
};

const updateCanvas = (
  canvas: HTMLCanvasElement,
  entities: Entity[],
  dimensions: Dimensions,
) => {
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Adjust the canvas size for HDPI screens
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1;
    const ratio = devicePixelRatio / backingStoreRatio;

    canvas.width = dimensions.width * ratio;
    canvas.height = dimensions.height * ratio;

    ctx.scale(ratio, ratio);

    const centerX = canvas.width / 2 / ratio;
    const centerY = canvas.height / 2 / ratio;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
      ctx.rotate((entity.rotation * Math.PI) / 180); // Convert degrees to radians
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

type Dimensions = {
  width: number;
  height: number;
};

const useCanvas = function () {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions>(null);

  useEffect(() => {
    const updateDimensions = () => {
      const canvasRef = ref.current;

      if (canvasRef) {
        const { offsetHeight, offsetWidth } = canvasRef;
        setDimensions({ width: offsetWidth, height: offsetHeight });
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

const Canvas: React.FC<CanvasProps> = ({ canvasData, onClick }) => {
  const { ref, dimensions } = useCanvas();

  useEffect(() => {
    if (ref.current && dimensions) {
      updateCanvas(ref.current, canvasData.entities, dimensions);
    }
  }, [ref, dimensions, canvasData]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();

    if (canvas && rect) {
      const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
      const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

      canvasData.entities.forEach((entity, index) => {
        if (
          mouseX >= entity.x &&
          mouseX <= entity.x + entity.width &&
          mouseY >= entity.y &&
          mouseY <= entity.y + entity.height
        ) {
          onClick(index);
        }
      });
    }
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0">
      <canvas
        ref={ref}
        id="canvas"
        className="w-full h-full" // Apply Tailwind CSS classes for full width and height
        onClick={handleCanvasClick}
      ></canvas>
    </div>
  );
};

export default Canvas;
