const MILESTONES = [
  10, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375,
  400, 425, 450, 475, 500,
];

export function getMilestoneInfo(total: number): {
  reached: number | null;
  next: number | null;
  nearNext: boolean;
} {
  const reached = [...MILESTONES].reverse().find((m) => m <= total) ?? null;
  const next = MILESTONES.find((m) => m > total) ?? null;
  const nearNext = next !== null && next - total <= 5;
  return { reached, next, nearNext };
}

export function formatVolume(lbs: number): string {
  if (lbs >= 1000) return `${(lbs / 1000).toFixed(1)}k`;
  return lbs.toFixed(0);
}
