import { expect, test, describe } from "vitest";
import * as timeline from "./timeline";
import { PlayState } from "./timeline";

describe("togglePlayPause", () => {
  test("plays paused timeline", () => {
    const tl = timeline.init();
    expect(timeline.togglePlayPause(tl).playState).toBe(PlayState.Playing);
  });

  test("pauses playing timeline", () => {
    const tl = timeline.togglePlayPause(timeline.init());
    expect(timeline.togglePlayPause(tl).playState).toBe(PlayState.Paused);
  });

  test("plays stopped timeline", () => {
    const tl = timeline.stop(timeline.init());
    const expected = timeline.togglePlayPause(tl);

    expect(expected.playState).toBe(PlayState.Playing);
    expect(expected.progress).toBe(0);
  });
});

describe("updateDuration", () => {
  test("updates duration and pauses the timeline ", () => {
    const tl = timeline.init();
    const expected = timeline.updateDuration(10, tl);

    expect(expected.playState).toBe(PlayState.Stopped);
    expect(expected.progress).toBe(0);
    expect(expected.duration).toBe(10);
  });
});
