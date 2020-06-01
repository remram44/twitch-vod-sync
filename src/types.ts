export interface VideoInfo {
  startDate: Date;
  duration: number;
}

export interface PlayerStatePaused {
  state: 'paused';
  position: Date;
}

export interface PlayerStatePlaying {
  state: 'playing';
  offset: number;
}

export type PlayerState = PlayerStatePaused | PlayerStatePlaying;
