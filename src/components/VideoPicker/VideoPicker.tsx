import React from 'react';

interface VideoPickerProps {
  onVideoPicked: (video: number) => void;
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
    if(this.inputRef.current) {
      let value = this.inputRef.current.value;
      let m = value.match(/^(?:https?:\/\/(?:www\.|m\.)?twitch\.tv\/videos\/)?([0-9]+)$/);
      if(m) {
        let video = parseInt(m[1]);
        console.log("Picked video: ", value, " ", video);
        this.props.onVideoPicked(video);
      } else {
        console.log("Wrong URL: ", value);
      }
    } else {
      console.error("No inputRef");
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" name="video" ref={this.inputRef} placeholder="Twitch video URL" />
        <input type="submit" value="Watch" />
      </form>
    );
  }
}
