import React from 'react';
import { parseDuration } from '../../utils';
import { VideoPicker } from '../VideoPicker/VideoPicker';
import { Timeline } from '../Timeline/Timeline';

interface ViewerProps {
  id: number;
  clientId: string;
  accessToken: string;
}

interface ViewerState {
  video?: number;
  videoDate?: Date;
  videoDuration?: number;
  currentPosition?: Date;
}

export class Viewer extends React.PureComponent<ViewerProps, ViewerState> {
  interval?: number;
  player?: Twitch.Player;

  constructor(props: ViewerProps) {
    super(props);
    this.state = this.initialState();
    this.interval = undefined;
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
      this.setState({
        videoDate: new Date(videoInfo.created_at),
        videoDuration: parseDuration(videoInfo.duration),
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
    this.interval = window.setInterval(this.updateTimestamp, 1000);
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
    this.interval = undefined;
  }

  updateTimestamp() {
    if (!this.state.videoDate || !this.player) {
      return;
    }
    let timestamp = this.state.videoDate.getTime();
    timestamp += this.player.getCurrentTime() * 1000;
    this.setState({ currentPosition: new Date(timestamp) });
  }

  render() {
    if (this.state.video) {
      let timeline;
      if (this.state.videoDate && this.state.videoDuration) {
        const videoInfo = new Map([
          [
            1,
            {
              startDate: this.state.videoDate,
              duration: this.state.videoDuration,
            },
          ],
        ]);
        timeline = (
          <Timeline
            currentPosition={this.state.currentPosition}
            videos={videoInfo}
          />
        );
      }
      return (
        <>
          <div id={'player' + this.props.id} className="player"></div>
          {timeline}
        </>
      );
    } else {
      return <VideoPicker onVideoPicked={this.handleVideoPicked} />;
    }
  }
}
