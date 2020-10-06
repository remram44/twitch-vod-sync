import React from 'react';
import { VideoInfo, PlayerState } from '../../types';
import { parseDuration, computeDelay, formatDelay } from '../../utils';
import { VideoPicker } from '../VideoPicker/VideoPicker';
import './Viewer.css';

interface ViewerProps {
  id: number;
  clientId: string;
  accessToken: string;
  state?: PlayerState;
  setVideoInfo: (id: number, info: VideoInfo | undefined) => void;
  setPlayerReady: () => void;
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
  startTimer?: number;

  constructor(props: ViewerProps) {
    super(props);
    this.state = this.initialState();
    this.player = undefined;
    this.delayRef = React.createRef();
    this.handleVideoPicked = this.handleVideoPicked.bind(this);
    this.handleDelayChange = this.handleDelayChange.bind(this);
    this.reset = this.reset.bind(this);
    this.startedPlaying = this.startedPlaying.bind(this);
  }

  initialState() {
    return {
      delay: 0,
    };
  }

  componentDidUpdate(prevProps: ViewerProps, prevState: ViewerState) {
    // Clear previous timer
    if (this.startTimer !== undefined) {
      window.clearTimeout(this.startTimer);
    }
    this.startTimer = undefined;

    if (
      this.props.state &&
      (this.props.state !== prevProps.state ||
        this.state.delay !== prevState.delay) &&
      this.player &&
      this.state.videoDate &&
      this.state.videoDuration
    ) {
      if (this.props.state.state === 'paused') {
        this.player.pause();
        this.player.seek(
          (this.props.state.position.getTime() -
            this.state.videoDate.getTime()) /
            1000.0 +
            this.state.delay
        );
      } else if (this.props.state.state === 'buffering') {
        this.player.seek(
          (this.props.state.position.getTime() -
            this.state.videoDate.getTime()) /
            1000.0 +
            this.state.delay
        );
        this.player.play();
      } else if (this.props.state.state === 'playing') {
        const seek =
          new Date().getTime() / 1000.0 +
          this.props.state.offset -
          this.state.videoDate.getTime() / 1000.0 +
          this.state.delay;
        if (seek > this.state.videoDuration) {
          // After the end - stop playback
          this.player.pause();
        } else if (seek < 0.0) {
          // Before the beginning - stop and set timer to start later
          this.player.seek(0);
          this.player.pause();
          this.startTimer = window.setTimeout(() => {
            if (this.player) {
              this.player.seek(0);
              this.player.play();
            }
          }, -seek * 1000);
        } else {
          // In range - seek
          this.player.seek(seek);
          this.player.play();
        }
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
    this.player.addEventListener(Twitch.Player.PLAYING, this.startedPlaying);
    console.log('Created player', this.player);
  }

  startedPlaying() {
    if (this.player && this.props.state?.state === 'buffering') {
      // Pause for now, wait for all videos to be ready
      this.player.pause();
      this.props.setPlayerReady();
    }
  }

  handleDelayChange(evt: React.FormEvent) {
    evt.preventDefault();
    if (this.delayRef?.current) {
      const delay = computeDelay(this.delayRef.current.value);

      this.setState({
        delay,
      });
      this.delayRef.current.value = formatDelay(delay);
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
                defaultValue={formatDelay(this.state.delay)}
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
