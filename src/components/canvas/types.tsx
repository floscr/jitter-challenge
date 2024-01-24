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
}

export const defaultCanvas = {
  entities: [],
};

export const exampleCanvas: Canvas = {
  entities: [
    {
      type: "rectangle",
      id: "1",
      x: 500,
      y: 100,
      width: 50,
      height: 200,
      rotation: 0,
      color: "red",
    },
    {
      type: "rectangle",
      id: "2",
      x: 500,
      y: 100,
      width: 50,
      height: 200,
      rotation: 90,
      color: "blue",
    },

    {
      type: "rectangle",
      id: "2",
      x: 0,
      y: 0,
      width: 70,
      height: 40,
      rotation: 80,
      color: "blue",
    },
  ],
};
