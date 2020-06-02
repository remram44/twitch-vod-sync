import React from 'react';
import { VideoInfo, PlayerState } from '../../types';
import { parseDuration } from '../../utils';
import { VideoPicker } from '../VideoPicker/VideoPicker';

interface ViewerProps {
  id: number;
  clientId: string;
  accessToken: string;
  state?: PlayerState;
  setVideoInfo: (id: number, info: VideoInfo) => void;
  onChange: (id: number, playerState: PlayerState) => void;
  width: number;
  height: number;
}

interface ViewerState {
  video?: number;
  videoDate?: Date;
  videoDuration?: number;
}

export class Viewer extends React.PureComponent<ViewerProps, ViewerState> {
  player?: Twitch.Player;

  constructor(props: ViewerProps) {
    super(props);
    this.state = this.initialState();
    this.player = undefined;
    this.handleVideoPicked = this.handleVideoPicked.bind(this);
  }

  initialState() {
    return {};
  }

  componentDidUpdate(prevProps: ViewerProps) {
    if (
      this.props.state &&
      this.props.state !== prevProps.state &&
      this.player &&
      this.state.videoDate
    ) {
      if (this.props.state.state === 'paused') {
        this.player.pause();
        this.player.seek(
          (this.props.state.position.getTime() -
            this.state.videoDate.getTime()) /
            1000.0
        );
      } else if (this.props.state.state === 'playing') {
        const seek =
          new Date().getTime() / 1000.0 +
          this.props.state.offset -
          this.state.videoDate.getTime() / 1000.0;
        this.player.seek(seek);
        this.player.play();
      }
    }
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
      autoplay: false,
    });
    console.log('Created player', this.player);
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
