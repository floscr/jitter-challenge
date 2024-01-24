import { match, P } from "ts-pattern";

type Duration = number;

export type PlayState = "playing" | "paused";

export const MIN_DURATION = 1;

export interface Timeline {
  playState: PlayState;
  duration: Duration;
  progress?: number;
  startTime?: Date;
}

export const init = function (duration = 1): Timeline {
  return {
    playState: "paused",
    duration,
    progress: 0,
  };
};

export const play = function (timeline: Timeline): Timeline {
  return {
    ...timeline,
    playState: "playing",
    startTime: Date.now(),
    progress: undefined,
  };
};

export const pause = function (timeline: Timeline): Timeline {
  return {
    ...timeline,
    playState: "paused",
    progress: undefined,
    startTime: undefined,
  };
};

export const isFinished = function ({ progress }: Timeline): boolean {
  return progress === 1;
};

export const isPlaying = function (timeline: Timeline): boolean {
  return timeline.playState === "playing";
};

export const isPaused = function ({ playState }: Timeline): boolean {
  return playState === "paused";
};

/* const progress = function (timeline: Timeline) {
 *   return match(timeline.playState)
 *   .with()
 * }; */

export const togglePlayPause = function (timeline: Timeline): Timeline {
  return isPlaying(timeline) ? pause(timeline) : play(timeline);
};

export const updateDuration = function (
  duration: Duration,
  timeline: Timeline,
): Timeline {
  return {
    ...timeline,
    playState: "paused",
    duration: Math.max(MIN_DURATION, duration),
  };
};
