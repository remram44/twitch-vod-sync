declare class TwitchEvent {}

declare namespace Twitch {
  export declare class Player {
    constructor(id: string, options: {
      width: number | string;
      height: number | string;
      video: number;
      autoplay?: boolean;
    });

    addEventListener(event: TwitchEvent, callback: () => void): void;
    getCurrentTime(): number;
    isPaused(): boolean;
    pause(): void;
    play(): void;
    seek(pos: number): void;

    static const READY: TwitchEvent;
    static const PAUSE: TwitchEvent;
    static const PLAYING: TwitchEvent;
    static const ERROR: TwitchEvent;
    static const ENDED: TwitchEvent;
  }
}
