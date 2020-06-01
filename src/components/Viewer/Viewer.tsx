import React from 'react';
import { VideoInfo } from '../../types';
import { parseDuration } from '../../utils';
import { VideoPicker } from '../VideoPicker/VideoPicker';

interface ViewerProps {
  id: number;
  clientId: string;
  accessToken: string;
  setVideoInfo: (info: VideoInfo) => void;
  onPositionChange: (position: Date) => void;
}

interface ViewerState {
  video?: number;
  videoDate?: Date;
  videoDuration?: number;
  currentPosition?: Date;
}

export class Viewer extends React.PureComponent<ViewerProps, ViewerState> {
  player?: Twitch.Player;
  offset?: number;
  interval?: number;

  constructor(props: ViewerProps) {
    super(props);
    this.state = this.initialState();
    this.player = undefined;
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
      this.props.setVideoInfo({
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
    this.setState({ currentPosition: timestamp });
    this.props.onPositionChange(timestamp);
  }

  render() {
    if (this.state.video) {
      return <div id={'player' + this.props.id} className="player"></div>;
    } else {
      return <VideoPicker onVideoPicked={this.handleVideoPicked} />;
    }
  }
}
