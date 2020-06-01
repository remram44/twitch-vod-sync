function npad(num: number, size: number): string {
  var s = "" + num;
  while(s.length < size) {
    s = "0" + s;
  }
  return s;
}

export function formatDate(d: Date): string {
  return (
    d.getFullYear() + "-"
    + npad(d.getMonth() + 1, 2) + "-"
    + npad(d.getDate(), 2) + " "
    + npad(d.getHours(), 2) + ":"
    + npad(d.getMinutes(), 2) + ":"
    + npad(d.getSeconds(), 2)
  );
}

export function parseDuration(s: string): number {
  var m =  s.match(/(?:([0-9]+)h)?([0-9]+)m([0-9]+)s/);
  if (!m) {
    throw Error("Invalid duration");
  }
  return (
    parseInt(m[1]) * 3600
    + parseInt(m[2]) * 60
    + parseInt(m[3])
  );
}
