import React from 'react';
import { formatDate } from '../../utils';
import { VideoInfo } from '../../types';

interface TimelineProps {
  videos: Map<number, VideoInfo>;
  currentPosition?: Date;
}

export function Timeline(props: TimelineProps) {
  if (props.videos.size === 0) {
    return <div className="timestamps"></div>;
  }
  const videos = Array.from(props.videos.values());
  const startDate = new Date(
    Math.min(...videos.map(v => v.startDate.getTime()))
  );
  const endDate = new Date(
    Math.max(...videos.map(v => v.startDate.getTime() + v.duration * 1000))
  );

  return (
    <div className="timestamps">
      <div>{formatDate(startDate)}</div>
      <div>
        {props.currentPosition ? formatDate(props.currentPosition) : undefined}
      </div>
      <div>{formatDate(endDate)}</div>
    </div>
  );
}
