# Jitter Technical Challenge

## Running the demo

To run the demo please run the following command:

``` sh
npm i
npm run dev
```

## Notes

### Canvas

The canvas origin is at the middle of the of canvas.

Entity `x` & `y` are at the center of their shape.

### Import / Export

Importing will only accept JSON files that match the spec of `Canvas` (without dimensions).

### Things I would improve/add

- Use context or a state management based system and move state in one context, to not end up with a large amount of `useState` in the `<Root />` component.
- Add a keyframes property to the entities to define a custom animations.
- Add a more general Math based function for canvas that wrap things like `Point`, `Area`, `BoundingBox` and have functions like `isPointInArea()` etc.
- Extract canvas painting functions
- Virtualize canvas painting, only paint what is in the Viewport
- Add unit tests
- User friendly warnings for import/export

