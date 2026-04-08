import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { api, type WorkoutSession, type DashboardStats } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SessionCard } from '@/components/SessionCard';
import { WorkoutHeatmap } from '@/components/WorkoutHeatmap';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import {
  Plus,
  LogOut,
  Settings,
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Flame,
  Dumbbell,
  Tally5,
  Footprints,
} from 'lucide-react';

const MILESTONES = [10, 25, 50, 100, 200, 500, 1000];

function getMilestoneInfo(total: number): {
  reached: number | null;
  next: number | null;
  nearNext: boolean;
} {
  const reached = [...MILESTONES].reverse().find((m) => m <= total) ?? null;
  const next = MILESTONES.find((m) => m > total) ?? null;
  const nearNext = next !== null && next - total <= 5;
  return { reached, next, nearNext };
}

function formatVolume(lbs: number): string {
  if (lbs >= 1000) return `${(lbs / 1000).toFixed(1)}k`;
  return lbs.toFixed(0);
}

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await api.getWorkoutSessions();
      setSessions(data);
    } catch {
      // handled by api client
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch {
      // non-critical — stats section stays hidden
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, [fetchSessions, fetchStats]);

  async function startNewWorkout() {
    const session = await api.createWorkoutSession({
      name: `Workout ${new Date().toLocaleDateString()}`,
    });
    navigate(`/workout/${session.id}`);
  }

  async function startCardioWorkout() {
    const session = await api.createWorkoutSession({
      name: `Cardio ${new Date().toLocaleDateString()}`,
      session_type: 'cardio',
    });
    navigate(`/workout/${session.id}`);
  }

  async function completeSession(id: number) {
    const updated = await api.updateWorkoutSession(id, {
      completed_at: new Date().toISOString(),
    });
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    // Refresh stats after completing a session
    fetchStats();
  }

  async function duplicateWorkout(id: number) {
    const session = await api.duplicateWorkoutSession(id);
    navigate(`/workout/${session.id}`);
  }

  async function deleteSession(id: number) {
    await api.deleteWorkoutSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  const pinnedSessions = sessions.filter((s) => s.pinned);
  const recentSessions = sessions.filter((s) => !s.pinned);

  const milestone = stats ? getMilestoneInfo(stats.total_workouts) : null;
  const weeklyGoal = stats?.weekly_goal ?? 3;
  const thisWeekCount = stats?.weekly_stats.this_week_count ?? 0;
  const lastWeekCount = stats?.weekly_stats.last_week_count ?? 0;
  const weekDelta = thisWeekCount - lastWeekCount;
  const thisWeekVol = stats?.weekly_stats.this_week_volume ?? 0;
  const lastWeekVol = stats?.weekly_stats.last_week_volume ?? 0;
  const volDelta =
    lastWeekVol > 0 ? ((thisWeekVol - lastWeekVol) / lastWeekVol) * 100 : 0;

  return (
    <div className='mx-auto max-w-2xl'>
      {/* Header */}
      <div className='sticky top-0 z-10 border-b bg-background px-4 pb-4 pt-4'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>📋 Workout Log</h1>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='text-sm text-muted-foreground me-4'>
              {user?.name}
            </span>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => navigate('/settings')}
            >
              <Settings className='h-5 w-5' />
            </Button>
            <Button variant='ghost' size='icon' onClick={logout}>
              <LogOut className='h-5 w-5' />
            </Button>
          </div>
        </div>

        <div className='flex gap-2'>
          <Button onClick={startNewWorkout} className='flex-1' size='lg'>
            <Plus className='mr-2 h-5 w-5' />
            Start Workout
          </Button>
          <Button onClick={startCardioWorkout} variant='outline' size='lg'>
            <Footprints className='mr-2 h-5 w-5' />
            Start Cardio
          </Button>
        </div>
      </div>

      <div className='p-4 space-y-4'>
        {/* Activity Heatmap */}
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          {!statsLoading && stats && stats.activity.length > 0 && (
            <WorkoutHeatmap activity={stats.activity} />
          )}

          {/* Muscle Group Balance */}
          {!statsLoading && stats && stats.muscle_groups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  Muscle Groups{' '}
                  <span className='text-xs font-normal text-muted-foreground'>
                    (last 30 days)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: { label: 'Sessions', color: '#ff6900' },
                  }}
                  className='h-38 w-full'
                >
                  <BarChart
                    data={stats.muscle_groups}
                    layout='vertical'
                    margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                  >
                    <XAxis
                      type='number'
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => (value % 1 ? '' : value)}
                    />
                    <YAxis
                      type='category'
                      dataKey='muscle_group'
                      width={80}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel />}
                      cursor={{ fill: 'hsl(var(--muted))' }}
                    />
                    <Bar
                      dataKey='count'
                      maxBarSize={16}
                      fill='var(--color-count)'
                    >
                      {/* {stats.muscle_groups.map((_, i) => (
                        <Cell
                          key={i}
                          fill={
                            i === 0
                              ? 'hsl(var(--chart-1))'
                              : 'hsl(var(--chart-2))'
                          }
                        />
                      ))} */}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats grid */}
        {!statsLoading && stats && (
          <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
            {/* Streak card */}
            <Card className='col-span-1'>
              <CardHeader>
                <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1'>
                  <Flame className='h-3 w-3' /> Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold leading-none'>
                  {stats.streak.current}
                  <span className='text-base font-normal text-muted-foreground ml-1'>
                    wks
                  </span>
                </div>
                <div className='mt-2 space-y-1'>
                  {/* Progress toward weekly goal */}
                  <div className='flex items-center gap-1.5'>
                    <div className='flex gap-0.5'>
                      {Array.from({ length: weeklyGoal }, (_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-4 rounded-full ${
                            i < thisWeekCount
                              ? 'bg-green-600 dark:bg-green-400'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      {thisWeekCount}/{weeklyGoal} this week
                    </span>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Best: {stats.streak.longest} wks
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* This Week card */}
            <Card className='col-span-1'>
              <CardHeader>
                <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1'>
                  <Dumbbell className='h-3 w-3' /> This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-baseline gap-1.5'>
                  <span className='text-3xl font-bold leading-none'>
                    {thisWeekCount}
                  </span>
                  <span className='text-base text-muted-foreground'>
                    sessions
                  </span>
                  {weekDelta !== 0 && (
                    <span
                      className={`text-xs font-bold flex items-center gap-1 ${weekDelta > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                      {weekDelta > 0 ? (
                        <TrendingUp className='h-3 w-3' />
                      ) : (
                        <TrendingDown className='h-3 w-3' />
                      )}
                      {Math.abs(weekDelta)}
                    </span>
                  )}
                  {weekDelta === 0 && lastWeekCount > 0 && (
                    <span className='text-xs text-muted-foreground flex items-center'>
                      <Minus className='h-3 w-3' />
                    </span>
                  )}
                </div>
                <div className='mt-2'>
                  {thisWeekVol > 0 ? (
                    <p className='text-xs text-muted-foreground'>
                      {formatVolume(thisWeekVol)} lbs
                      {lastWeekVol > 0 && (
                        <span
                          className={`ml-1 ${volDelta > 0 ? 'text-green-500' : volDelta < 0 ? 'text-red-500' : ''}`}
                        >
                          {volDelta > 0 ? '+' : ''}
                          {volDelta.toFixed(0)}% vol vs last wk
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className='text-xs text-muted-foreground'>
                      No volume logged yet
                    </p>
                  )}
                  <p className='text-xs text-muted-foreground'>
                    Last week: {lastWeekCount}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Total workouts card */}
            <Card className='col-span-1'>
              <CardHeader>
                <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1'>
                  <Tally5 className='h-3 w-3' /> Workouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold leading-none'>
                  {stats.total_workouts}
                </div>
                <div className='mt-2'>
                  {milestone?.reached === stats.total_workouts && (
                    <Badge
                      variant='default'
                      className='text-xs bg-green-600 hover:bg-green-600'
                    >
                      🎉 {milestone.reached} milestone!
                    </Badge>
                  )}
                  {milestone?.nearNext &&
                    milestone.reached !== stats.total_workouts &&
                    milestone.next && (
                      <p className='text-xs text-muted-foreground'>
                        {milestone.next - stats.total_workouts} to go until{' '}
                        {milestone.next}!
                      </p>
                    )}
                  {!milestone?.nearNext && milestone?.reached && (
                    <p className='text-xs text-muted-foreground'>
                      Next milestone: {milestone.next ?? '∞'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent PRs card */}
            <Card className='col-span-1'>
              <CardHeader>
                <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1'>
                  <Trophy className='h-3 w-3' /> Recent PRs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recent_prs.length === 0 ? (
                  <p className='text-xs text-muted-foreground'>
                    No new PRs in the last 30 days
                  </p>
                ) : (
                  <ul className='space-y-1'>
                    {stats.recent_prs.slice(0, 3).map((pr, i) => (
                      <li
                        key={i}
                        className='flex items-center justify-between gap-1'
                      >
                        <span className='text-xs truncate text-foreground'>
                          {pr.exercise_name}
                        </span>
                        <span className='text-xs font-semibold text-green-600 dark:text-green-400 shrink-0'>
                          {pr.weight} lbs
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Session lists */}
        {loading ? (
          <p className='text-center text-muted-foreground'>Loading...</p>
        ) : (
          <>
            {pinnedSessions.length > 0 && (
              <>
                <hr className='mt-6' />
                <h2 className='mb-3 text-lg font-semibold'>Favorites</h2>
                <div className='space-y-3'>
                  {pinnedSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onComplete={completeSession}
                      onDuplicate={duplicateWorkout}
                      onDelete={deleteSession}
                      onOpen={(id) => navigate(`/workout/${id}`)}
                    />
                  ))}
                </div>
              </>
            )}

            <>
              <hr className='mt-6' />
              <h2 className='mb-3 text-lg font-semibold'>Recent Workouts</h2>
              {recentSessions.length === 0 && pinnedSessions.length === 0 ? (
                <p className='text-center text-muted-foreground py-8'>
                  No workouts yet. Start your first one!
                </p>
              ) : (
                <div className='space-y-3'>
                  {recentSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onComplete={completeSession}
                      onDuplicate={duplicateWorkout}
                      onDelete={deleteSession}
                      onOpen={(id) => navigate(`/workout/${id}`)}
                    />
                  ))}
                </div>
              )}
            </>
          </>
        )}
      </div>
    </div>
  );
}
