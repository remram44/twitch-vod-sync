import React from 'react';

interface VideoPickerProps {
  onVideoPicked: (video: number) => void;
  onChannelPicked: (channel: string) => void;
}

export class VideoPicker extends React.PureComponent<VideoPickerProps> {
  inputRef: React.RefObject<HTMLInputElement>;

  constructor(props: VideoPickerProps) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.inputRef = React.createRef();
  }

  handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    if (this.inputRef.current) {
      const value = this.inputRef.current.value;
      const video_id_match = value.match(
        /^(?:https?:\/\/(?:www\.|m\.)?twitch\.tv\/videos\/)?([0-9]+)(?:\?.*)?$/
      );
      if (video_id_match) {
        const video = Number(video_id_match[1]);
        console.log('Picked video: ', value, ' ', video);
        this.props.onVideoPicked(video);
      } else {
        const channel_match = value.match(
          /^(?:https?:\/\/(?:www\.|m\.)?twitch\.tv\/)?([a-zA-Z0-9]\w+)\/?(?:\?.*)?$/
        );

        if (channel_match) {
          const channel = String(channel_match[1]);
          console.log('Picked channel: ', value, ' ', channel);
          this.props.onChannelPicked(channel);
        } else {
          console.log('Input URL did not match a video ID nor a channel: ', value);
        }
      }
    } else {
      console.error('No inputRef');
    }
  }

  render() {
    return (
      <div className="picker">
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            name="video"
            ref={this.inputRef}
            placeholder="Twitch video URL"
          />
          <input type="submit" value="Watch" />
        </form>
      </div>
    );
  }
}
