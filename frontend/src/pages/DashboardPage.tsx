import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { api, type WorkoutSession } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pin, Copy, Trash2, LogOut } from 'lucide-react';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function startNewWorkout() {
    const session = await api.createWorkoutSession({
      name: `Workout ${new Date().toLocaleDateString()}`,
    });
    navigate(`/workout/${session.id}`);
  }

  async function duplicateWorkout(id: number) {
    const session = await api.duplicateWorkoutSession(id);
    navigate(`/workout/${session.id}`);
  }

  async function togglePin(session: WorkoutSession) {
    const updated = await api.updateWorkoutSession(session.id, {
      pinned: !session.pinned,
    });
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  async function deleteSession(id: number) {
    await api.deleteWorkoutSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  const pinnedSessions = sessions.filter((s) => s.pinned);
  const recentSessions = sessions.filter((s) => !s.pinned);

  return (
    <div className='mx-auto max-w-2xl p-4'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Workout Log</h1>
        </div>
        <div className='flex items-center space-x-2'>
          <span className='text-sm text-muted-foreground'>{user?.name}</span>
          <Button variant='ghost' size='icon' onClick={logout}>
            <LogOut className='h-5 w-5' />
          </Button>
        </div>
      </div>

      <Button onClick={startNewWorkout} className='mb-6 w-full' size='lg'>
        <Plus className='mr-2 h-5 w-5' />
        Start New Workout
      </Button>

      {loading ? (
        <p className='text-center text-muted-foreground'>Loading...</p>
      ) : (
        <>
          {pinnedSessions.length > 0 && (
            <div className='mb-6'>
              <h2 className='mb-3 text-lg font-semibold'>Favorites</h2>
              <div className='space-y-3'>
                {pinnedSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onDuplicate={duplicateWorkout}
                    onTogglePin={togglePin}
                    onDelete={deleteSession}
                    onOpen={(id) => navigate(`/workout/${id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
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
                    onDuplicate={duplicateWorkout}
                    onTogglePin={togglePin}
                    onDelete={deleteSession}
                    onOpen={(id) => navigate(`/workout/${id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SessionCard({
  session,
  onDuplicate,
  onTogglePin,
  onDelete,
  onOpen,
}: {
  session: WorkoutSession;
  onDuplicate: (id: number) => void;
  onTogglePin: (session: WorkoutSession) => void;
  onDelete: (id: number) => void;
  onOpen: (id: number) => void;
}) {
  const isCompleted = !!session.completed_at;
  const exerciseNames = session.exercises.map((e) => e.exercise.name);
  const totalSets = session.exercises.reduce(
    (sum, e) => sum + e.sets.length,
    0,
  );

  return (
    <Card
      className='cursor-pointer transition-colors hover:bg-accent/50'
      onClick={() => onOpen(session.id)}
    >
      <CardHeader className='p-4 pb-2'>
        <div className='flex items-start justify-between'>
          <div className='min-w-0 flex-1'>
            <CardTitle className='text-base'>
              {session.name || 'Untitled Workout'}
            </CardTitle>
            <p className='text-xs text-muted-foreground'>
              {new Date(session.created_at).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className='flex gap-1' onClick={(e) => e.stopPropagation()}>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => onTogglePin(session)}
            >
              <Pin
                className={`h-4 w-4 ${session.pinned ? 'fill-current' : ''}`}
              />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => onDuplicate(session.id)}
            >
              <Copy className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-destructive'
              onClick={() => onDelete(session.id)}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-4 pt-0'>
        <div className='flex flex-wrap gap-1'>
          {isCompleted && <Badge variant='secondary'>Completed</Badge>}
          {!isCompleted && session.started_at && (
            <Badge variant='outline'>In Progress</Badge>
          )}
          {totalSets > 0 && (
            <Badge variant='secondary'>
              {totalSets} {totalSets === 1 ? 'set' : 'sets'}
            </Badge>
          )}
        </div>
        {exerciseNames.length > 0 && (
          <p className='mt-2 text-sm text-muted-foreground truncate'>
            {exerciseNames.join(', ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
