import React from 'react';
import './VodSyncApp.css';
import { VideoInfo, PlayerState } from '../../types';
import { Timeline } from '../Timeline/Timeline';
import { Viewer } from '../Viewer/Viewer';

const TWITCH_CLIENT_ID = 'r69vc9claq1m3n960hrkuszot4nx54';

interface VodSyncAppProps {}

interface VodSyncAppState {
  accessToken: string | null;
  viewers: number;
  playerState: PlayerState;
  currentPosition?: Date;
  videos: Map<number, VideoInfo>;
  width: number;
}

export class VodSyncApp extends React.PureComponent<
  VodSyncAppProps,
  VodSyncAppState
> {
  interval?: number;

  constructor(props: VodSyncAppProps) {
    super(props);
    this.state = this.initialState();
    this.setVideoInfo = this.setVideoInfo.bind(this);
    this.handlePlayerStateChange = this.handlePlayerStateChange.bind(this);
    this.handleSeek = this.handleSeek.bind(this);
    this.resized = this.resized.bind(this);
    window.addEventListener('resize', this.resized);
  }

  initialState(): VodSyncAppState {
    const match = window.location.hash.match(/#access_token=([^&]+)/);
    let accessToken = null;
    if (match && match[1]) {
      accessToken = match[1];
      console.log('Got access token: ', accessToken);
    }
    return {
      accessToken,
      viewers: 2,
      playerState: {
        state: 'paused',
        position: new Date(1),
      },
      videos: new Map(),
      width: window.innerWidth / 2 - 6,
    };
  }

  componentDidMount() {
    this.interval = window.setInterval(
      this.computeCurrentPosition.bind(this),
      1000
    );
  }

  componentWillUnmount() {
    if (this.interval !== undefined) {
      window.clearInterval(this.interval);
      this.interval = undefined;
    }
    window.removeEventListener('resize', this.resized);
  }

  resized() {
    const desiredWH = 4.0 / 3.0;
    const desiredHW = 1.0 / desiredWH;
    this.setState(state => {
      let bestDist = 999999.0;
      let bestRows = 1;
      for (let rows = 1; rows <= state.viewers; ++rows) {
        const cols = Math.ceil(state.viewers / rows);
        const w = window.innerWidth / cols - 6;
        const h = (window.innerHeight - 20) / rows - 6;
        const dist = Math.max(
          Math.abs(w / h - desiredWH),
          Math.abs(h / w - desiredHW)
        );
        if (dist < bestDist) {
          bestDist = dist;
          bestRows = rows;
        }
      }
      const columns = Math.ceil(state.viewers / bestRows);
      return {
        width: window.innerWidth / columns - 6,
      };
    });
  }

  setVideoInfo(id: number, info: VideoInfo | undefined) {
    console.log('setVideoInfo: ', id, ', ', info);
    this.setState(state => {
      const videos = new Map(state.videos);
      if (info) {
        videos.set(id, info);
      } else {
        videos.delete(id);
      }

      // Update the player state to fall within at least one video
      let playerState = state.playerState;
      if (state.videos.size > 0) {
        const videosArray = Array.from(state.videos.values());
        const start = Math.min(...videosArray.map(v => v.startDate.getTime()));
        const end = Math.max(
          ...videosArray.map(v => v.startDate.getTime() + v.duration * 1000)
        );
        if (this.state.playerState.state === 'paused') {
          if (this.state.playerState.position.getTime() < start) {
            playerState = {
              state: 'paused',
              position: new Date(start),
            };
          } else if (this.state.playerState.position.getTime() > end) {
            playerState = {
              state: 'paused',
              position: new Date(end),
            };
          }
        } else if (this.state.playerState.state === 'playing') {
          const minOffset = (start - new Date().getTime()) / 1000.0;
          const maxOffset = (end - new Date().getTime()) / 1000.0;
          if (this.state.playerState.offset < minOffset) {
            playerState = {
              state: 'playing',
              offset: minOffset,
            };
          } else if (this.state.playerState.offset > maxOffset) {
            playerState = {
              state: 'playing',
              offset: maxOffset,
            };
          }
        }
      }
      return { videos, playerState };
    });
  }

  handlePlayerStateChange(id: number, playerState: PlayerState) {
    // TODO: Handle unexpected state change in players
  }

  computeCurrentPosition() {
    this.setState(state => {
      let currentPosition;
      if (state.playerState?.state === 'paused') {
        currentPosition = state.playerState.position;
      } else if (state.playerState?.state === 'playing') {
        currentPosition = new Date(
          new Date().getTime() + state.playerState.offset * 1000.0
        );
      } else {
        return {};
      }
      return { currentPosition };
    });
  }

  handleSeek(position: Date) {
    const offset = (position.getTime() - new Date().getTime()) / 1000.0;
    this.setState({
      playerState: {
        state: 'playing',
        offset,
      },
    });
  }

  render() {
    if (!this.state.accessToken) {
      setTimeout(() => {
        window.location.href =
          'https://id.twitch.tv/oauth2/authorize?client_id=' +
          TWITCH_CLIENT_ID +
          '&redirect_uri=https://remram44.github.io/twitch-vod-sync/&response_type=token&scope=';
      }, 2000);
      return <p>Redirecting you to Twitch to authorize use of their API...</p>;
    }

    const viewers = [];
    for (let i = 0; i < this.state.viewers; ++i) {
      viewers.push(
        <Viewer
          id={i}
          key={i}
          clientId={TWITCH_CLIENT_ID}
          accessToken={this.state.accessToken}
          state={this.state.playerState}
          setVideoInfo={this.setVideoInfo}
          onChange={this.handlePlayerStateChange}
          width={this.state.width}
        />
      );
    }

    return (
      <div className="view-container">
        <div className="videos">{viewers}</div>
        <div className="timeline">
          <Timeline
            currentPosition={this.state.currentPosition}
            videos={this.state.videos}
            onSeek={this.handleSeek}
          />
        </div>
      </div>
    );
  }
}
