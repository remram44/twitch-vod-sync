export interface VideoInfo {
  startDate: Date;
  duration: number;
}

export interface PlayerStatePaused {
  state: 'paused';
  position: Date;
}

export interface PlayerStateBuffering {
  state: 'buffering';
  position: Date;
  videosBuffering: Set<number>;
}

export interface PlayerStatePlaying {
  state: 'playing';
  offset: number;
}

export type PlayerState =
  | PlayerStatePaused
  | PlayerStateBuffering
  | PlayerStatePlaying;

export interface PlayerDelayTime {
  delayFormat: string,
  delaySeconds: number
}