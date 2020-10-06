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

export function computeDelay(time: string): number {
  const m = time.match(/^(-?)(?:(?:([0-9]+):)?([0-9]+)(?:m|min|:))?([0-9]+)?$/);
  //                     ^  ^^  ^            ^^      ^^          ^^^       ^
  //                     |  ||  +------------+|      |+----------+|+-------+
  //                     +--+|     optional   +------+  required  | optional
  //                     sign|      hours     minutes   delimiter | seconds
  //                         +------------------------------------+
  //                                 optional hours+minutes
  if (!m) {
    return 0;
  } else {
    const sign = m[1] === '-' ? -1 : 1;
    const nums: number[] = m
      .slice(2, 5)
      .map(n => (n !== undefined ? Number(n) : 0));
    return sign * (nums[0] * 3600 + nums[1] * 60 + nums[2]);
  }
}

export function formatDelay(seconds: number): string {
  let sign = '';
  if (seconds < 0) {
    sign = '-';
    seconds = -seconds;
  }
  const numbers = [
    // Minutes
    Math.floor((seconds / 60) % 60),
    // Seconds
    seconds % 60,
  ];
  // Hours are only shown if non-zero
  if (seconds >= 3600) {
    numbers.splice(0, 0, Math.floor(seconds / 3600));
  }
  return sign + numbers.map(s => ('' + s).padStart(2, '0')).join(':');
}
