import React from 'react';
import './VodSyncApp.css';
import { VideoInfo, PlayerState } from '../../types';
import { Timeline } from '../Timeline/Timeline';
import { Viewer } from '../Viewer/Viewer';

const TWITCH_CLIENT_ID = 'r69vc9claq1m3n960hrkuszot4nx54';

interface VodSyncAppProps {}

interface VodSyncAppState {
  accessToken: string | null;
  playerState?: PlayerState;
  currentPosition?: Date;
  videos: Map<number, VideoInfo>;
}

export class VodSyncApp extends React.PureComponent<
  VodSyncAppProps,
  VodSyncAppState
> {
  interval?: number;

  constructor(props: VodSyncAppProps) {
    super(props);
    this.state = this.initialState();
    this.interval = window.setInterval(
      this.computeCurrentPosition.bind(this),
      1000
    );
  }

  initialState() {
    const match = window.location.hash.match(/#access_token=([^&]+)/);
    let accessToken = null;
    if (match && match[1]) {
      accessToken = match[1];
      console.log('Got access token: ', accessToken);
    }
    return {
      accessToken,
      videos: new Map(),
    };
  }

  componentWillUnmount() {
    if (this.interval !== undefined) {
      window.clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  setVideoInfo(id: number, info: VideoInfo) {
    console.log('setVideoInfo: ', id, ', ', info);
    this.setState(state => {
      const videos = new Map(state.videos);
      videos.set(id, info);
      return { videos };
    });
  }

  handlePlayerStateChange(id: number, playerState: PlayerState) {
    this.setState({ playerState });
    this.computeCurrentPosition();
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

    return (
      <>
        <Viewer
          id={1}
          clientId={TWITCH_CLIENT_ID}
          accessToken={this.state.accessToken}
          setVideoInfo={(info: VideoInfo) => this.setVideoInfo(1, info)}
          onChange={(playerState: PlayerState) =>
            this.handlePlayerStateChange(1, playerState)
          }
        />
        <Timeline
          currentPosition={this.state.currentPosition}
          videos={this.state.videos}
        />
      </>
    );
  }
}
