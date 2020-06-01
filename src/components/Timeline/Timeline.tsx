import React from 'react';
import { formatDate } from '../../utils';

interface VideoInfo {
  startDate: Date;
  duration: number;
}

interface TimelineProps {
  videos: Map<number, VideoInfo>;
  currentPosition?: Date;
}

export class Timeline extends React.PureComponent<TimelineProps> {
  startDate: Date;
  endDate: Date;

  constructor(props: TimelineProps) {
    super(props);
    let videos = Array.from(props.videos.values());
    this.startDate = new Date(
      Math.min(
        ...videos.map(v => v.startDate.getTime())
      )
    );
    this.endDate = new Date(
      Math.max(
        ...videos.map(v => v.startDate.getTime() + v.duration * 1000)
      )
    );
  }

  render() {
    return (
      <div className="timestamps">
        <div>{formatDate(this.startDate)}</div>
        <div>{this.props.currentPosition ? formatDate(this.props.currentPosition) : undefined}</div>
        <div>{formatDate(this.endDate)}</div>
      </div>
    );
  }
}
