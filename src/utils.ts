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
