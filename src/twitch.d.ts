declare class TwitchEvent {}

declare namespace Twitch {
  export declare class Player {
    constructor(id: string, options: {
      width: number | string;
      height: number | string;
      video: number;
    });

    addEventListener(event: TwitchEvent, callback: () => void): void;
    getCurrentTime(): number;
    isPaused(): boolean;

    static const READY: TwitchEvent;
    static const PLAYING: TwitchEvent;
    static const PAUSE: TwitchEvent;
  }
}
