import { useState } from 'react';
import { type WorkoutSessionExercise } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Check, Trash2 } from 'lucide-react';

interface ExerciseCardProps {
  wse: WorkoutSessionExercise;
  disabled: boolean;
  onAddSet: () => void;
  onUpdateSet: (
    setId: number,
    data: { reps?: number; weight?: number; completed?: boolean },
  ) => void;
  onDeleteSet: (setId: number) => void;
  onRemove: () => void;
}

export function ExerciseCard({
  wse,
  disabled,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onRemove,
}: ExerciseCardProps) {
  // Track local input state for each set
  const [localValues, setLocalValues] = useState<
    Record<number, { weight: string; reps: string }>
  >({});

  const getLocalValue = (setId: number, field: 'weight' | 'reps') => {
    // Use local value if it exists, otherwise fall back to server value
    if (localValues[setId]?.[field] !== undefined) {
      return localValues[setId][field];
    }
    const set = wse.sets.find((s) => s.id === setId);
    return set?.[field]?.toString() ?? '';
  };

  const updateLocalValue = (
    setId: number,
    field: 'weight' | 'reps',
    value: string,
  ) => {
    setLocalValues((prev) => ({
      ...prev,
      [setId]: {
        ...prev[setId],
        [field]: value,
      },
    }));
  };

  const handleBlur = (
    setId: number,
    field: 'weight' | 'reps',
    value: string,
  ) => {
    // Update server
    onUpdateSet(setId, {
      [field]: value ? Number(value) : undefined,
    });
    // Clear local value so it syncs with server response
    setLocalValues((prev) => {
      const newValues = { ...prev };
      if (newValues[setId]) {
        delete newValues[setId][field];
        if (!newValues[setId].weight && !newValues[setId].reps) {
          delete newValues[setId];
        }
      }
      return newValues;
    });
  };

  return (
    <Card>
      <CardHeader className='p-4 pb-2'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-base'>{wse.exercise.name}</CardTitle>
            <div className='flex gap-1 mt-1'>
              <Badge variant='secondary' className='text-xs'>
                {wse.exercise.muscle_group}
              </Badge>
              <Badge variant='outline' className='text-xs'>
                {wse.exercise.equipment}
              </Badge>
            </div>
          </div>
          {!disabled && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-destructive'
              onClick={onRemove}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className='p-4 pt-2'>
        {wse.sets.length > 0 && (
          <div className='mb-2'>
            <div className='grid grid-cols-[2rem_1fr_1fr_2rem_2rem] gap-2 text-xs font-medium text-muted-foreground mb-1'>
              <span>Set</span>
              <span>Weight</span>
              <span>Reps</span>
              <span></span>
              <span></span>
            </div>
            {wse.sets.map((set) => (
              <div
                key={set.id}
                className='grid grid-cols-[2rem_1fr_1fr_2rem_2rem] gap-2 items-center mb-1'
              >
                <span className='text-sm text-muted-foreground text-center'>
                  {set.set_number}
                </span>
                <Input
                  type='number'
                  placeholder='lbs'
                  value={getLocalValue(set.id, 'weight')}
                  onChange={(e) =>
                    updateLocalValue(set.id, 'weight', e.target.value)
                  }
                  onBlur={(e) =>
                    handleBlur(set.id, 'weight', e.target.value)
                  }
                  disabled={disabled}
                  className='h-8 text-sm'
                />
                <Input
                  type='number'
                  placeholder='reps'
                  value={getLocalValue(set.id, 'reps')}
                  onChange={(e) =>
                    updateLocalValue(set.id, 'reps', e.target.value)
                  }
                  onBlur={(e) =>
                    handleBlur(set.id, 'reps', e.target.value)
                  }
                  disabled={disabled}
                  className='h-8 text-sm'
                />
                <Button
                  variant={set.completed ? 'default' : 'outline'}
                  size='icon'
                  className='h-8 w-8'
                  onClick={() =>
                    onUpdateSet(set.id, { completed: !set.completed })
                  }
                  disabled={disabled}
                >
                  <Check className='h-3 w-3' />
                </Button>
                {!disabled && (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-destructive'
                    onClick={() => onDeleteSet(set.id)}
                  >
                    <Trash2 className='h-3 w-3' />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        {!disabled && (
          <Button
            variant='ghost'
            size='sm'
            className='w-full'
            onClick={onAddSet}
          >
            <Plus className='mr-1 h-3 w-3' />
            Add Set
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
