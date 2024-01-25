import { clamp } from "ramda";
import { v4 as randomUuid } from "uuid";

export interface Rectangle {
  type: "rectangle";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
}

export type Entity = Rectangle;

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

export const exampleCanvas: Canvas = {
  entities: [
    {
      type: "rectangle",
      id: randomUuid(),
      x: 100,
      y: 0,
      width: 200,
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

const randomRectangleEntity = function (canvas: Canvas): Entity {
  const dimensions = canvas.dimensions!;

  const width = randomRectangleSideLength();
  const height = randomRectangleSideLength();

  const canvasSideWidth = dimensions.width + width / 2;
  const canvasSideHeight = dimensions.height + height / 2;

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
    rotation: 0,
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
