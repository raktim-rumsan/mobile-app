export function truncateAddress(
  id: string,
  start: number = 6,
  end: number = 6,
): string {
  if (id.length <= start + end) return id;
  return `${id.slice(0, start)}...${id.slice(-end)}`;
}
