import React from 'react';
import { formatDate } from '../../utils';
import { VideoInfo } from '../../types';
import './Timeline.css';

interface TimelineProps {
  videos: Map<number, VideoInfo>;
  currentPosition?: Date;
  playing: boolean;
  onSeek: (position: Date) => void;
  onViewersChange: (change: 1 | -1) => void;
  onPlayingStateChange: (playing: boolean) => void;
}

function color(id: number) {
  if (id === 0) {
    return '#aaf';
  } else if (id === 1) {
    return '#faa';
  } else if (id === 2) {
    return '#afa';
  } else if (id === 3) {
    return '#aff';
  } else if (id === 4) {
    return '#faf';
  } else {
    return '#ffa';
  }
}

export function Timeline(props: TimelineProps) {
  if (props.videos.size === 0) {
    return <div className="timestamps"></div>;
  }
  const videos = Array.from(props.videos.entries());
  videos.sort((a, b) => a[0] - b[0]);
  const startDate = new Date(
    Math.min(...videos.map(([i, v]) => v.startDate.getTime()))
  );
  const endDate = new Date(
    Math.max(
      ...videos.map(([i, v]) => v.startDate.getTime() + v.duration * 1000)
    )
  );

  const s = startDate.getTime(),
    e = endDate.getTime();

  const tsRef: React.RefObject<HTMLDivElement> = React.createRef();

  function handleClick(evt: React.MouseEvent) {
    if (!tsRef.current) {
      return;
    }
    const bounds = tsRef.current.getBoundingClientRect();
    const ratio = (evt.clientX - bounds.x) / bounds.width;
    props.onSeek(new Date(s + (e - s) * ratio));
  }

  function handlePlayPause() {
    props.onPlayingStateChange(!props.playing);
  }

  const lineHeight = 100.0 / videos.length;

  const lines = videos.map(([id, info], idx) => (
    <rect
      key={id}
      height={lineHeight + '%'}
      y={lineHeight * idx + '%'}
      x={((info.startDate.getTime() - s) / (e - s)) * 100.0 + '%'}
      width={(info.duration / (e - s)) * 1000.0 * 100.0 + '%'}
      style={{ fill: color(id) }}
    />
  ));

  let position = undefined;
  if (props.currentPosition) {
    position = (
      <rect
        height={'100%'}
        width={'2px'}
        x={((props.currentPosition.getTime() - s) / (e - s)) * 100.0 + '%'}
        style={{ fill: 'black' }}
      />
    );
  }

  return (
    <>
      <div className="buttons">
        <input
          type="button"
          value={props.playing ? 'pause' : 'play'}
          onClick={handlePlayPause}
        />
        <input
          type="button"
          value="-"
          onClick={e => {
            e.preventDefault();
            props.onViewersChange(-1);
          }}
        />
        <input
          type="button"
          value="+"
          onClick={e => {
            e.preventDefault();
            props.onViewersChange(1);
          }}
        />
      </div>
      <div className="timestamps" ref={tsRef} onClick={handleClick}>
        <svg>
          {lines}
          {position}
        </svg>
        <div>
          <div>{formatDate(startDate)}</div>
          <div>
            {props.currentPosition
              ? formatDate(props.currentPosition)
              : undefined}
          </div>
          <div>{formatDate(endDate)}</div>
        </div>
      </div>
    </>
  );
}
