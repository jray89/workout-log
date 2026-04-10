/** Format elapsed seconds as M:SS or H:MM:SS */
export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Format a duration in milliseconds as "Xh Ym" or "Ym" */
export function formatDuration(
  ms: number,
  showSeconds: boolean = false,
): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = Math.floor((ms % 60000) / 1000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (showSeconds) return `${minutes}m ${seconds}s`;
  return `${minutes}m`;
}

/** Compute and format the duration between two ISO date strings */
export function duration(from: string, to: string): string {
  return formatDuration(timeDiffMilliseconds(from, to));
}

/** Compute the duration in milliseconds between two ISO date strings */
export function timeDiffMilliseconds(from: string, to: string): number {
  return new Date(to).getTime() - new Date(from).getTime();
}
