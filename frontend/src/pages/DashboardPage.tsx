import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { api, type WorkoutSession } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SessionCard } from '@/components/SessionCard';
import { Plus, LogOut } from 'lucide-react';

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
