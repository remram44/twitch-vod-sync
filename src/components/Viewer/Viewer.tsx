import React from 'react';
import { VideoInfo, PlayerState } from '../../types';
import { parseDuration } from '../../utils';
import { VideoPicker } from '../VideoPicker/VideoPicker';

interface ViewerProps {
  id: number;
  clientId: string;
  accessToken: string;
  setVideoInfo: (id: number, info: VideoInfo) => void;
  onChange: (id: number, playerState: PlayerState) => void;
  width: number;
  height: number;
}

interface ViewerState {
  video?: number;
  videoDate?: Date;
  videoDuration?: number;
  currentPosition?: Date;
}

const MAX_DELTA = 0.8;

export class Viewer extends React.PureComponent<ViewerProps, ViewerState> {
  player?: Twitch.Player;
  playerState?: PlayerState;
  interval?: number;

  constructor(props: ViewerProps) {
    super(props);
    this.state = this.initialState();
    this.player = undefined;
    this.playerState = undefined;
    this.handleVideoPicked = this.handleVideoPicked.bind(this);
    this.updateTimestamp = this.updateTimestamp.bind(this);
  }

  initialState() {
    return {};
  }

  async handleVideoPicked(video: number) {
    this.setState({ video });

    // Get video information from API
    const response = await fetch(
      'https://api.twitch.tv/helix/videos?id=' + video,
      {
        headers: {
          'Client-ID': this.props.clientId,
          Authorization: 'Bearer ' + this.props.accessToken,
        },
      }
    );
    if (response.status === 200) {
      const json = await response.json();
      const videoInfo = json.data[0];
      console.log('Got video date: ', videoInfo.created_at);
      const videoDate = new Date(videoInfo.created_at);
      const videoDuration = parseDuration(videoInfo.duration);
      this.setState({
        videoDate,
        videoDuration,
      });
      this.props.setVideoInfo(this.props.id, {
        startDate: videoDate,
        duration: videoDuration,
      });
    }

    // Create player
    this.player = new Twitch.Player('player' + this.props.id, {
      width: '100%',
      height: '100%',
      video,
    });
    this.player.addEventListener(Twitch.Player.READY, this.updateTimestamp);
    this.player.addEventListener(Twitch.Player.PLAYING, this.updateTimestamp);
    this.player.addEventListener(Twitch.Player.PAUSE, this.updateTimestamp);
    console.log('Created player', this.player);
    this.interval = window.setInterval(this.updateTimestamp, 1000);
  }

  componentWillUnmount() {
    if (this.interval !== undefined) {
      window.clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  updateTimestamp() {
    if (!this.state.videoDate || !this.player) {
      return;
    }
    const timestamp = new Date(
      this.state.videoDate.getTime() + this.player.getCurrentTime() * 1000
    );
    if (this.player.isPaused()) {
      this.playerStateChanged({
        state: 'paused',
        position: timestamp,
      });
    } else {
      this.playerStateChanged({
        state: 'playing',
        offset: (timestamp.getTime() - new Date().getTime()) / 1000.0,
      });
    }
  }

  playerStateChanged(newPlayerState: PlayerState): boolean {
    if (this.playerState !== undefined) {
      if (
        newPlayerState.state === 'paused' &&
        this.playerState.state === 'paused'
      ) {
        const delta =
          this.playerState.position.getTime() -
          newPlayerState.position.getTime();
        if (Math.abs(delta) <= MAX_DELTA) {
          return false;
        }
      } else if (
        newPlayerState.state === 'playing' &&
        this.playerState.state === 'playing'
      ) {
        const delta = this.playerState.offset - newPlayerState.offset;
        if (Math.abs(delta) <= MAX_DELTA) {
          return false;
        }
      }
    }
    console.log('update state');
    this.playerState = newPlayerState;
    this.props.onChange(this.props.id, newPlayerState);
    return true;
  }

  render() {
    if (this.state.video) {
      return (
        <div
          id={'player' + this.props.id}
          className="player"
          style={{
            width: this.props.width + 'px',
            height: this.props.height + 'px',
          }}
        ></div>
      );
    } else {
      return (
        <div
          style={{
            width: this.props.width + 'px',
            height: this.props.height + 'px',
          }}
        >
          <VideoPicker onVideoPicked={this.handleVideoPicked} />
        </div>
      );
    }
  }
}
