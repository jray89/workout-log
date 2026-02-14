import { type WorkoutSession } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Check } from 'lucide-react';

interface SessionCardProps {
  session: WorkoutSession;
  onComplete: (id: number) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
  onOpen: (id: number) => void;
}

export function SessionCard({
  session,
  onComplete,
  onDuplicate,
  onDelete,
  onOpen,
}: SessionCardProps) {
  const isCompleted = !!session.completed_at;
  const exerciseNames = session.exercises.map((e) => e.exercise.name);
  const totalSets = session.exercises.reduce(
    (sum, e) => sum + e.sets.length,
    0,
  );

  const cardColor = isCompleted
    ? 'hover:bg-neutral-100/10'
    : 'bg-green-200/10 hover:bg-green-200/15';

  return (
    <Card
      className={`cursor-pointer transition-colors ${cardColor}`}
      onClick={() => onOpen(session.id)}
    >
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div className='min-w-0 flex-1'>
            <CardTitle className='text-base flex flex-wrap gap-2 items-center'>
              {session.name || 'Untitled Workout'}
              {!isCompleted && <Badge>In Progress</Badge>}
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
            {!isCompleted && (
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => onComplete(session.id)}
              >
                <Check className='h-4 w-4' />
              </Button>
            )}
            {/* <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => onTogglePin(session)}
            >
              <Pin
                className={`h-4 w-4 ${session.pinned ? 'fill-current' : ''}`}
              />
            </Button> */}
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
      <CardContent>
        <div className='flex flex-wrap gap-2 items-center'>
          {totalSets > 0 && (
            <Badge variant='secondary'>
              {totalSets} {totalSets === 1 ? 'set' : 'sets'}
            </Badge>
          )}
          {exerciseNames.length > 0 && (
            <div className='text-sm text-muted-foreground truncate'>
              {exerciseNames.join(', ')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
