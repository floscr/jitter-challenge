type Duration = number;

export type PlayState = "playing" | "paused";

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
  };
};

export const play = function (timeline: Timeline): Timeline {
  return {
    ...timeline,
    playState: "playing",
    startTime: new Date(),
  };
};

export const isPlaying = function ({ playState }: Timeline): boolean {
  return playState === "playing";
};

export const isPaused = function ({ playState }: Timeline): boolean {
  return playState === "paused";
};

export const pause = function (timeline: Timeline): Timeline {
  return {
    ...timeline,
    playState: "paused",
    startTime: undefined,
  };
};

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
    duration: duration,
  };
};
