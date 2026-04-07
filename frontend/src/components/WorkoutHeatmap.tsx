import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityEntry {
  date: string;
  count: number;
}

interface Props {
  activity: ActivityEntry[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SHORT_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function cellColor(count: number): string {
  if (count === 0) return 'bg-muted';
  if (count === 1) return 'bg-green-200 dark:bg-green-900';
  if (count === 2) return 'bg-green-400 dark:bg-green-700';
  return 'bg-green-600 dark:bg-green-500';
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function WorkoutHeatmap({ activity }: Props) {
  if (!activity.length) return null;

  // Day-of-week for the first entry (0=Mon…6=Sun, ISO-style)
  const firstDate = parseLocalDate(activity[0].date);
  // JS getDay(): 0=Sun,1=Mon…6=Sat → convert to Mon=0…Sun=6
  const firstDow = (firstDate.getDay() + 6) % 7;

  // Build grid cells: leading empty pads + one entry per activity day
  type Cell = { empty: true } | { empty: false; entry: ActivityEntry; date: Date };
  const cells: Cell[] = [
    ...Array.from({ length: firstDow }, () => ({ empty: true as const })),
    ...activity.map((entry) => ({ empty: false as const, entry, date: parseLocalDate(entry.date) })),
  ];

  // Split into weeks (columns of 7)
  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  // Month label per column: show month name when it first appears in that column
  const monthLabels: (string | null)[] = weeks.map((week, wi) => {
    const firstReal = week.find((c) => !c.empty) as { empty: false; date: Date } | undefined;
    if (!firstReal) return null;
    const month = firstReal.date.getMonth();
    // Show label if this is the first week of that month OR first column
    if (wi === 0) return MONTHS[month];
    const prevWeek = weeks[wi - 1];
    const prevReal = prevWeek.find((c) => !c.empty) as { empty: false; date: Date } | undefined;
    if (!prevReal || prevReal.date.getMonth() !== month) return MONTHS[month];
    return null;
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Activity</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="overflow-x-auto">
          <div className="inline-flex flex-col gap-1 min-w-0">
            {/* Month labels row */}
            <div className="flex gap-1 pl-7">
              {weeks.map((_, wi) => (
                <div key={wi} className="w-3 text-[10px] text-muted-foreground leading-none">
                  {monthLabels[wi] ?? ''}
                </div>
              ))}
            </div>

            {/* Grid: day labels on left, week columns */}
            <div className="flex gap-1">
              {/* Day-of-week labels */}
              <div className="flex flex-col gap-1 w-6 shrink-0">
                {SHORT_DAYS.map((d, i) => (
                  <div
                    key={i}
                    className="h-3 text-[10px] text-muted-foreground leading-none flex items-center"
                    aria-label={DAYS[i]}
                  >
                    {/* Only show M, W, F to avoid crowding */}
                    {i % 2 === 0 ? d : ''}
                  </div>
                ))}
              </div>

              {/* Week columns */}
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }, (_, di) => {
                    const cell = week[di];
                    if (!cell || cell.empty) {
                      return <div key={di} className="w-3 h-3 rounded-sm bg-transparent" />;
                    }
                    const { entry, date } = cell as { empty: false; entry: ActivityEntry; date: Date };
                    const label = `${date.toDateString()}: ${entry.count} workout${entry.count !== 1 ? 's' : ''}`;
                    return (
                      <div
                        key={di}
                        className={`w-3 h-3 rounded-sm ${cellColor(entry.count)} cursor-default transition-opacity hover:opacity-75`}
                        title={label}
                        aria-label={label}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 pl-7 mt-1">
              <span className="text-[10px] text-muted-foreground">Less</span>
              {[0, 1, 2, 3].map((n) => (
                <div key={n} className={`w-3 h-3 rounded-sm ${cellColor(n)}`} />
              ))}
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
