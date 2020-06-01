import React from 'react';
import './VodSyncApp.css';
import { VideoInfo } from '../../types';
import { Timeline } from '../Timeline/Timeline';
import { Viewer } from '../Viewer/Viewer';

const TWITCH_CLIENT_ID = 'r69vc9claq1m3n960hrkuszot4nx54';

interface VodSyncAppProps {}

interface VodSyncAppState {
  accessToken: string | null;
  currentPosition?: Date;
  videos: Map<number, VideoInfo>;
}

export class VodSyncApp extends React.PureComponent<
  VodSyncAppProps,
  VodSyncAppState
> {
  constructor(props: VodSyncAppProps) {
    super(props);
    this.state = this.initialState();
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

  setVideoInfo(id: number, info: VideoInfo) {
    console.log('setVideoInfo: ', id, ', ', info);
    this.setState(state => {
      const videos = new Map(state.videos);
      videos.set(id, info);
      return { videos };
    });
  }

  handleSeek(id: number, position: Date) {
    this.setState({ currentPosition: position });
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
          onPositionChange={(position: Date) => this.handleSeek(1, position)}
        />
        <Timeline
          currentPosition={this.state.currentPosition}
          videos={this.state.videos}
        />
      </>
    );
  }
}
