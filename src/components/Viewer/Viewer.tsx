import React from 'react';
import { VideoInfo, PlayerState } from '../../types';
import { parseDuration } from '../../utils';
import { VideoPicker } from '../VideoPicker/VideoPicker';
import './Viewer.css';

interface ViewerProps {
  id: number;
  clientId: string;
  accessToken: string;
  state?: PlayerState;
  setVideoInfo: (id: number, info: VideoInfo | undefined) => void;
  onChange: (id: number, playerState: PlayerState) => void;
  width: number;
}

interface ViewerState {
  delay: number;
  video?: number;
  videoDate?: Date;
  videoDuration?: number;
}

export class Viewer extends React.PureComponent<ViewerProps, ViewerState> {
  player?: Twitch.Player;
  delayRef?: React.RefObject<HTMLInputElement>;

  constructor(props: ViewerProps) {
    super(props);
    this.state = this.initialState();
    this.player = undefined;
    this.delayRef = React.createRef();
    this.handleVideoPicked = this.handleVideoPicked.bind(this);
    this.handleDelayChange = this.handleDelayChange.bind(this);
    this.reset = this.reset.bind(this);
  }

  initialState() {
    return {
      delay: 0,
    };
  }

  componentDidUpdate(prevProps: ViewerProps, prevState: ViewerState) {
    if (
      this.props.state &&
      (this.props.state !== prevProps.state ||
        this.state.delay !== prevState.delay) &&
      this.player &&
      this.state.videoDate
    ) {
      if (this.props.state.state === 'paused') {
        this.player.pause();
        this.player.seek(
          (this.props.state.position.getTime() -
            this.state.videoDate.getTime()) /
            1000.0 +
            this.state.delay
        );
      } else if (this.props.state.state === 'playing') {
        const seek =
          new Date().getTime() / 1000.0 +
          this.props.state.offset -
          this.state.videoDate.getTime() / 1000.0 +
          this.state.delay;
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

  handleDelayChange(evt: React.FormEvent) {
    evt.preventDefault();
    if (this.delayRef?.current) {
      let delay = Number(this.delayRef.current.value);
      if (isNaN(delay)) {
        delay = 0;
      }
      this.setState({ delay });
      this.delayRef.current.value = '' + delay;
    }
  }

  reset() {
    this.setState({
      delay: 0,
      video: undefined,
      videoDate: undefined,
      videoDuration: undefined,
    });
    this.props.setVideoInfo(this.props.id, undefined);
  }

  render() {
    if (this.state.video) {
      return (
        <div
          className="viewer"
          style={{
            width: this.props.width + 'px',
          }}
        >
          <div id={'player' + this.props.id} className="player"></div>
          <div className="options">
            <form onSubmit={this.handleDelayChange}>
              Delay:{' '}
              <input
                type="text"
                name="delay"
                ref={this.delayRef}
                defaultValue={this.state.delay}
              />{' '}
              <input type="submit" value="Set" />
            </form>
            <input type="button" onClick={this.reset} value="Reset" />
          </div>
        </div>
      );
    } else {
      return (
        <div
          className="viewer"
          style={{
            width: this.props.width + 'px',
          }}
        >
          <VideoPicker onVideoPicked={this.handleVideoPicked} />
        </div>
      );
    }
  }
}
