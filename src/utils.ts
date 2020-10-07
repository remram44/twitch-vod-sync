import { PlayerDelayTime } from './types';

function npad(num: number, size: number): string {
  let s = '' + num;
  while (s.length < size) {
    s = '0' + s;
  }
  return s;
}

export function formatDate(d: Date): string {
  return (
    d.getFullYear() +
    '-' +
    npad(d.getMonth() + 1, 2) +
    '-' +
    npad(d.getDate(), 2) +
    ' ' +
    npad(d.getHours(), 2) +
    ':' +
    npad(d.getMinutes(), 2) +
    ':' +
    npad(d.getSeconds(), 2)
  );
}

export function parseDuration(s: string): number {
  const m = s.match(/(?:([0-9]+)h)?([0-9]+)m([0-9]+)s/);
  if (!m) {
    throw Error('Invalid duration');
  } else if (m[1]) {
    return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  } else {
    return Number(m[2]) * 60 + Number(m[3]);
  }
}

function timeToSeconds(time: number[]): number {
  const seconds = time[0] * 3600 + time[1] * 60 + time[2];
  return seconds;
}

function normalizeTime(time: number[]): number[] {
  const extraSeconds = Math.floor(time[2] / 60);
  time[2] -= 60 * extraSeconds;
  time[1] += extraSeconds;
  const extraMinutes = Math.floor(time[1] / 60);
  time[1] -= 60 * extraMinutes;
  time[0] += extraMinutes;

  return time;
}

function prettifyTime(time: number[]): string[] {
  const prettyTime = time.map(num => ('0' + num).slice(-2));
  return prettyTime;
}

export function computeDelay(time: string): PlayerDelayTime {
  const playerDelay: PlayerDelayTime = {
    delayFormat: '0',
    delaySeconds: 0,
  };

  if (!time.length) return playerDelay;
  const isNegative: boolean = time[0] === '-';
  if (isNegative) time = time.substr(1);

  try {
    let cleanTimeList: string[] = new Array(3).fill('0');
    const COLON_STRING = ':';
    const MINUTE_STRING = 'm';

    if (time.includes(COLON_STRING)) {
      const timeStringList: string[] = time.split(COLON_STRING);

      if (!(timeStringList.length === 2 || timeStringList.length === 3)) {
        throw new Error('Invalid time');
      }
      const [hh, mm, ss = '0'] = timeStringList;
      cleanTimeList = [hh, mm, ss];
    } else if (time.includes(MINUTE_STRING)) {
      cleanTimeList[1] = time.split(MINUTE_STRING)[0];
    } else {
      cleanTimeList[2] = time;
    }

    const formattedTime = normalizeTime(
      cleanTimeList.map(time => Number(time))
    );
    const timeSeconds: number = timeToSeconds(formattedTime);
    playerDelay.delayFormat =
      (isNegative ? '-' : '') + prettifyTime(formattedTime).join(COLON_STRING);
    playerDelay.delaySeconds = timeSeconds * (isNegative ? -1 : 1);
    return playerDelay;
  } catch {
    return playerDelay;
  }
}
