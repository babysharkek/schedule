export function dateLabel(d: Date): string {
  return `${weekdayShort(d)} ${d.getMonth() + 1}/${d.getDate()}`;
}

export function weekdayShort(d: Date): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

export function monthName(m: number): string {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][m];
}

export function fullDateLabel(d: Date): string {
  const wd = weekdayShort(d);
  const m = monthName(d.getMonth());
  return `${wd}, ${m} ${d.getDate()}`;
}