import { clamp } from "ramda";
import { v4 as randomUuid } from "uuid";
import { z } from "zod";

const Entity = z.object({
  type: z.enum(["rectangle"]),
  id: z.string().uuid(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  color: z.string(),
  rotation: z.number(),
});

export type Entity = z.infer<typeof Entity>;

export interface Canvas {
  entities: Array<Entity>;
  dimensions?: {
    ratio: number;
    width: number;
    height: number;
  };
}

export const defaultCanvas = {
  entities: [],
};

export const CanvasJson = z.object({
  entities: z.array(Entity),
});

export const exampleCanvas: Canvas = {
  entities: [
    {
      type: "rectangle",
      id: randomUuid(),
      x: 100,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      color: "red",
    },
    {
      type: "rectangle",
      id: randomUuid(),
      x: 500,
      y: 100,
      width: 50,
      height: 200,
      rotation: 0,
      color: "red",
    },
    {
      type: "rectangle",
      id: randomUuid(),
      x: 500,
      y: 100,
      width: 50,
      height: 200,
      rotation: 90,
      color: "blue",
    },
    {
      type: "rectangle",
      id: randomUuid(),
      x: 0,
      y: 0,
      width: 70,
      height: 40,
      rotation: 80,
      color: "blue",
    },
  ],
};

const MIN_RECTANGLE_LENGTH = 100;
const MAX_RECTANGLE_LENGTH = 800;

const randomRectangleSideLength = (): number => {
  const side = Math.random() * 500;
  return clamp(MIN_RECTANGLE_LENGTH, MAX_RECTANGLE_LENGTH, side);
};

const randomSign = () => (Math.random() < 0.5 ? 1 : -1);

const randomHexColor = () => {
  // Generate a random integer between 0 and 16777215 (FFFFFF in hexadecimal)
  const randomColor = Math.floor(Math.random() * 16777215);

  // Convert the random integer to a hex color and pad with zeros if needed
  const hexColor = `#${randomColor.toString(16).padStart(6, "0")}`;

  return hexColor;
};

function rotatedRectangleBounds(
  width: number,
  height: number,
  angle: number,
): {
  width: number;
  height: number;
} {
  const radians = (angle * Math.PI) / 180;

  return {
    width:
      Math.abs(width * Math.cos(radians)) +
      Math.abs(height * Math.sin(radians)),
    height:
      Math.abs(width * Math.sin(radians)) +
      Math.abs(height * Math.cos(radians)),
  };
}

const randomRectangleEntity = function (canvas: Canvas): Entity {
  const dimensions = canvas.dimensions!;
  const ratio = dimensions.ratio;

  const rotation = Math.random() * 360;

  const { width, height } = rotatedRectangleBounds(
    randomRectangleSideLength(),
    randomRectangleSideLength(),
    rotation,
  );

  const canvasSideWidth = (dimensions.width / 2 + width / 2) / ratio;
  const canvasSideHeight = (dimensions.height / 2 + height / 2) / ratio;

  const x = Math.random() * canvasSideWidth * randomSign();
  const y = Math.random() * canvasSideHeight * randomSign();

  const color = randomHexColor();

  return {
    type: "rectangle",
    id: randomUuid(),
    x,
    y,
    width,
    height,
    rotation,
    color,
  };
};

export const addRandomRectangleEntity = function (canvas: Canvas) {
  return {
    ...canvas,
    entities: canvas.entities.concat([randomRectangleEntity(canvas)]),
  };
};

export const randomizeRectangleColor = function (
  entityId: string,
  canvas: Canvas,
) {
  return {
    ...canvas,
    entities: canvas.entities.map(function (entity: Entity) {
      if (entity.id === entityId) {
        return {
          ...entity,
          color: randomHexColor(),
        };
      }

      return entity;
    }),
  };
};
