type Duration = number;

export enum PlayState {
  Playing = "playing",
  Paused = "paused",
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
    playState: PlayState.Paused,
    duration,
    progress: 0,
    startTime: 0,
  };
};

export const play = function (timeline: Timeline): Timeline {
  console.log(timeline);
  return {
    ...timeline,
    playState: PlayState.Playing,
    startTime: Date.now(),
  };
};

export const pause = function (timeline: Timeline): Timeline {
  return {
    ...timeline,
    playState: PlayState.Paused,
    progress: undefined,
  };
};

export const isFinished = function ({ progress }: Timeline): boolean {
  return progress === 1;
};

export const isPlaying = function (timeline: Timeline): boolean {
  return timeline.playState === PlayState.Playing;
};

export const isPaused = function ({ playState }: Timeline): boolean {
  return playState === PlayState.Paused;
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
    playState: PlayState.Paused,
    duration: Math.max(MIN_DURATION, duration),
  };
};
