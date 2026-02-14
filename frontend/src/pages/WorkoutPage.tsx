import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  api,
  type WorkoutSession,
  type Exercise,
  type WorkoutSessionExercise,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ExerciseCard } from '@/components/ExerciseCard';
import { ExerciseHistoryCard } from '@/components/ExerciseHistoryCard';
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Search,
  Pencil,
  X,
  Check,
} from 'lucide-react';

export function WorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const fetchSession = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.getWorkoutSession(Number(id));
      setSession(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (showExercisePicker && exercises.length === 0) {
      api.getExercises().then(setExercises);
    }
  }, [showExercisePicker, exercises.length]);

  async function addExercise(exerciseId: number) {
    if (!session) return;
    await api.addExerciseToSession(session.id, exerciseId);
    await fetchSession();
    setShowExercisePicker(false);
    setSearchQuery('');
  }

  async function removeExercise(wseId: number) {
    if (!session) return;
    await api.removeExerciseFromSession(session.id, wseId);
    await fetchSession();
  }

  async function addSet(wse: WorkoutSessionExercise) {
    if (!session) return;
    await api.addSet(session.id, wse.id);
    await fetchSession();
  }

  async function updateSet(
    wseId: number,
    setId: number,
    data: { reps?: number; weight?: number; completed?: boolean },
  ) {
    if (!session) return;
    await api.updateSet(session.id, wseId, setId, data);
    await fetchSession();
  }

  async function deleteSet(wseId: number, setId: number) {
    if (!session) return;
    await api.deleteSet(session.id, wseId, setId);
    await fetchSession();
  }

  async function finishWorkout() {
    if (!session) return;
    await api.updateWorkoutSession(session.id, {
      completed_at: new Date().toISOString(),
    } as Partial<WorkoutSession>);
    navigate('/');
  }

  function startEditingName() {
    if (!session) return;
    setEditedName(session.name || '');
    setIsEditingName(true);
  }

  function cancelEditingName() {
    setIsEditingName(false);
    setEditedName('');
  }

  async function saveWorkoutName() {
    if (!session || !editedName.trim()) return;
    await api.updateWorkoutSession(session.id, {
      name: editedName.trim(),
    } as Partial<WorkoutSession>);
    await fetchSession();
    setIsEditingName(false);
    setEditedName('');
  }

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className='flex h-screen items-center justify-center'>
        Workout not found
      </div>
    );
  }

  const isCompleted = !!session.completed_at;

  const filteredExercises = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.muscle_group.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const groupedExercises = filteredExercises.reduce(
    (acc, ex) => {
      const group = ex.muscle_group || 'Other';
      if (!acc[group]) acc[group] = [];
      acc[group].push(ex);
      return acc;
    },
    {} as Record<string, Exercise[]>,
  );

  return (
    <div className='mx-auto max-w-2xl p-4'>
      <div className='mb-4 flex items-center gap-3'>
        <Button variant='ghost' size='icon' onClick={() => navigate('/')}>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <div className='flex-1'>
          {isEditingName ? (
            <div className='flex items-center gap-2'>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveWorkoutName();
                  if (e.key === 'Escape') cancelEditingName();
                }}
                className='h-8 text-lg font-bold'
                autoFocus
              />
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={cancelEditingName}
              >
                <X className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={saveWorkoutName}
              >
                <Check className='h-4 w-4' />
              </Button>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <h1 className='text-xl font-bold'>
                {session.name || 'Untitled Workout'}
              </h1>
              {!isCompleted && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6'
                  onClick={startEditingName}
                >
                  <Pencil className='h-3 w-3' />
                </Button>
              )}
            </div>
          )}
          <p className='text-xs text-muted-foreground'>
            {new Date(session.started_at).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        {!isCompleted && (
          <Button onClick={finishWorkout} variant='default' size='sm'>
            <CheckCircle2 className='mr-1 h-4 w-4' />
            Finish
          </Button>
        )}
      </div>

      {isCompleted && (
        <div className='mb-4 rounded-md bg-secondary p-3 text-center text-sm'>
          Workout completed on{' '}
          {new Date(session.completed_at!).toLocaleDateString()}
        </div>
      )}

      <div className='space-y-4'>
        {session.exercises.map((wse) => (
          <div key={wse.id} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <ExerciseCard
              wse={wse}
              disabled={isCompleted}
              onAddSet={() => addSet(wse)}
              onUpdateSet={(
                setId: number,
                data: { reps?: number; weight?: number; completed?: boolean },
              ) => updateSet(wse.id, setId, data)}
              onDeleteSet={(setId: number) => deleteSet(wse.id, setId)}
              onRemove={() => removeExercise(wse.id)}
            />
            <ExerciseHistoryCard
              exerciseId={wse.exercise.id}
              exerciseName={wse.exercise.name}
            />
          </div>
        ))}
      </div>

      {!isCompleted && !showExercisePicker && (
        <Button
          onClick={() => setShowExercisePicker(true)}
          variant='outline'
          className='mt-4 w-full'
        >
          <Plus className='mr-2 h-4 w-4' />
          Add Exercise
        </Button>
      )}

      {showExercisePicker && (
        <Card className='mt-4'>
          <CardHeader className='p-4 pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base'>Add Exercise</CardTitle>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setShowExercisePicker(false);
                  setSearchQuery('');
                }}
              >
                Cancel
              </Button>
            </div>
            <div className='relative mt-2'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search exercises...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
                autoFocus
              />
            </div>
          </CardHeader>
          <CardContent className='max-h-80 overflow-y-auto p-4 pt-2'>
            {Object.entries(groupedExercises).map(([group, exs]) => (
              <div key={group} className='mb-3'>
                <p className='mb-1 text-xs font-semibold uppercase text-muted-foreground'>
                  {group}
                </p>
                {exs.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => addExercise(ex.id)}
                    className='flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent'
                  >
                    <span>{ex.name}</span>
                    <Badge variant='secondary' className='text-xs'>
                      {ex.equipment}
                    </Badge>
                  </button>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
