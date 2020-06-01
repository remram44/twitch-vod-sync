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

export function Timeline(props: TimelineProps) {
  let videos = Array.from(props.videos.values());
  let startDate = new Date(
    Math.min(
      ...videos.map(v => v.startDate.getTime())
    )
  );
  let endDate = new Date(
    Math.max(
      ...videos.map(v => v.startDate.getTime() + v.duration * 1000)
    )
  );

  return (
    <div className="timestamps">
      <div>{formatDate(startDate)}</div>
      <div>{props.currentPosition ? formatDate(props.currentPosition) : undefined}</div>
      <div>{formatDate(endDate)}</div>
    </div>
  );
}
