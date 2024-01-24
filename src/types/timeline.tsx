import { match } from "ts-pattern";

type Duration = number;

export enum PlayState {
  Playing = "playing",
  Paused = "paused",
  Stopped = "stopped",
}

export const MIN_DURATION = 1;

export interface Timeline {
  playState: PlayState;
  duration: Duration;
  progress?: number;
  startTime: number;
}

export const init = function (duration = 1): Timeline {
  return {
    playState: PlayState.Stopped,
    duration,
    progress: 0,
    startTime: 0,
  };
};

export const play = function (timeline: Timeline): Timeline {
  return {
    ...timeline,
    playState: PlayState.Playing,
    startTime: performance.now(),
  };
};

export const replay = function (timeline: Timeline): Timeline {
  return {
    ...play(timeline),
    progress: 0,
  };
};

export const pause = function (timeline: Timeline): Timeline {
  return {
    ...timeline,
    playState: PlayState.Paused,
    progress: undefined,
  };
};

export const stop = function (timeline: Timeline) {
  return {
    ...timeline,
    playState: PlayState.Stopped,
  };
};

export const isPlaying = function (timeline: Timeline): boolean {
  return timeline.playState === PlayState.Playing;
};

export const isPaused = function ({ playState }: Timeline): boolean {
  return playState === PlayState.Paused;
};

export const togglePlayPause = function (timeline: Timeline): Timeline {
  return match(timeline)
    .with({ playState: PlayState.Playing }, pause)
    .with({ playState: PlayState.Paused }, play)
    .with({ playState: PlayState.Stopped }, replay)
    .otherwise((tl) => tl);
};

export const updateDuration = function (
  duration: Duration,
  timeline: Timeline,
): Timeline {
  return {
    ...timeline,
    playState: PlayState.Paused,
    duration: Math.max(MIN_DURATION, duration),
  };
};
