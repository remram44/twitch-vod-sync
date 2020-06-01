import React from 'react';
import { formatDate, parseDuration } from '../../utils';
import { VideoPicker } from '../VideoPicker/VideoPicker';

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
    let response = await fetch(
      "https://api.twitch.tv/helix/videos?id=" + video,
      {
        headers: {
          "Client-ID": this.props.clientId,
          "Authorization": "Bearer " + this.props.accessToken,
        },
      },
    );
    if(response.status === 200) {
      let json = await response.json();
      var videoInfo = json.data[0];
      console.log("Got video date: ", videoInfo.created_at);
      this.setState({
        videoDate: new Date(videoInfo.created_at),
        videoDuration: parseDuration(videoInfo.duration),
      });
    }

    // Create player
    this.player = new Twitch.Player("player" + this.props.id, {
      width: "100%",
      height: "100%",
      video: video,
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
    if(!this.state.videoDate || !this.player) {
      return;
    }
    let timestamp = this.state.videoDate.getTime();
    timestamp += this.player.getCurrentTime() * 1000;
    this.setState({ currentPosition: new Date(timestamp) });
  }

  render() {
    if(this.state.video) {
      let startDate = '';
      let endDate = '';
      if(this.state.videoDate && this.state.videoDuration) {
        startDate = formatDate(this.state.videoDate);
        endDate = formatDate(
          new Date(
            this.state.videoDate.getTime()
            + this.state.videoDuration * 1000
          )
        );
      }
      let currentDate = '';
      if(this.state.currentPosition) {
        currentDate = formatDate(this.state.currentPosition);
      }
      return <>
        <div id={"player" + this.props.id} className="player"></div>
        <div className="timestamps">
          <div>{startDate}</div>
          <div>{currentDate}</div>
          <div>{endDate}</div>
        </div>
      </>;
    } else {
      return <VideoPicker onVideoPicked={this.handleVideoPicked} />;
    }
  }
}
