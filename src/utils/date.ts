export function parseRelativeTime(relativeTime: string): Date {
  const now = new Date();
  const [amount, unit] = relativeTime.split(" ");
  const value = parseInt(amount, 10);

  switch (unit) {
    case "minute":
    case "minutes":
      return new Date(now.getTime() - value * 60 * 1000);
    case "hour":
    case "hours":
      return new Date(now.getTime() - value * 60 * 60 * 1000);
    case "day":
    case "days":
      return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
    case "week":
    case "weeks":
      return new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000);
    case "month":
    case "months":
      return new Date(now.getTime() - value * 30 * 24 * 60 * 60 * 1000);
    case "year":
    case "years":
      return new Date(now.getTime() - value * 365 * 24 * 60 * 60 * 1000);
    default:
      return now;
  }
}
