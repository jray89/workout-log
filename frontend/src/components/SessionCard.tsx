import { type WorkoutSession } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pin, Copy, Trash2 } from 'lucide-react';

interface SessionCardProps {
  session: WorkoutSession;
  onDuplicate: (id: number) => void;
  onTogglePin: (session: WorkoutSession) => void;
  onDelete: (id: number) => void;
  onOpen: (id: number) => void;
}

export function SessionCard({
  session,
  onDuplicate,
  onTogglePin,
  onDelete,
  onOpen,
}: SessionCardProps) {
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
              {new Date(session.started_at).toLocaleDateString(undefined, {
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
