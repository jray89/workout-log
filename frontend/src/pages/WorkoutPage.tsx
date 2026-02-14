import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  api,
  type WorkoutSession,
  type Exercise,
  type WorkoutSessionExercise,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Plus,
  Check,
  Trash2,
  CheckCircle2,
  Search,
} from "lucide-react";

export function WorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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
    setSearchQuery("");
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
    data: { reps?: number; weight?: number; completed?: boolean }
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
    navigate("/");
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        Workout not found
      </div>
    );
  }

  const isCompleted = !!session.completed_at;

  const filteredExercises = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.muscle_group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedExercises = filteredExercises.reduce(
    (acc, ex) => {
      const group = ex.muscle_group || "Other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(ex);
      return acc;
    },
    {} as Record<string, Exercise[]>
  );

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            {session.name || "Untitled Workout"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {new Date(session.started_at).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {!isCompleted && (
          <Button onClick={finishWorkout} variant="default" size="sm">
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Finish
          </Button>
        )}
      </div>

      {isCompleted && (
        <div className="mb-4 rounded-md bg-secondary p-3 text-center text-sm">
          Workout completed on{" "}
          {new Date(session.completed_at!).toLocaleDateString()}
        </div>
      )}

      <div className="space-y-4">
        {session.exercises.map((wse) => (
          <ExerciseCard
            key={wse.id}
            wse={wse}
            disabled={isCompleted}
            onAddSet={() => addSet(wse)}
            onUpdateSet={(setId, data) => updateSet(wse.id, setId, data)}
            onDeleteSet={(setId) => deleteSet(wse.id, setId)}
            onRemove={() => removeExercise(wse.id)}
          />
        ))}
      </div>

      {!isCompleted && !showExercisePicker && (
        <Button
          onClick={() => setShowExercisePicker(true)}
          variant="outline"
          className="mt-4 w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Exercise
        </Button>
      )}

      {showExercisePicker && (
        <Card className="mt-4">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Add Exercise</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowExercisePicker(false);
                  setSearchQuery("");
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto p-4 pt-2">
            {Object.entries(groupedExercises).map(([group, exs]) => (
              <div key={group} className="mb-3">
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  {group}
                </p>
                {exs.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => addExercise(ex.id)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent"
                  >
                    <span>{ex.name}</span>
                    <Badge variant="secondary" className="text-xs">
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

function ExerciseCard({
  wse,
  disabled,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onRemove,
}: {
  wse: WorkoutSessionExercise;
  disabled: boolean;
  onAddSet: () => void;
  onUpdateSet: (
    setId: number,
    data: { reps?: number; weight?: number; completed?: boolean }
  ) => void;
  onDeleteSet: (setId: number) => void;
  onRemove: () => void;
}) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{wse.exercise.name}</CardTitle>
            <div className="flex gap-1 mt-1">
              <Badge variant="secondary" className="text-xs">
                {wse.exercise.muscle_group}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {wse.exercise.equipment}
              </Badge>
            </div>
          </div>
          {!disabled && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {wse.sets.length > 0 && (
          <div className="mb-2">
            <div className="grid grid-cols-[2rem_1fr_1fr_2rem_2rem] gap-2 text-xs font-medium text-muted-foreground mb-1">
              <span>Set</span>
              <span>Weight</span>
              <span>Reps</span>
              <span></span>
              <span></span>
            </div>
            {wse.sets.map((set) => (
              <div
                key={set.id}
                className="grid grid-cols-[2rem_1fr_1fr_2rem_2rem] gap-2 items-center mb-1"
              >
                <span className="text-sm text-muted-foreground text-center">
                  {set.set_number}
                </span>
                <Input
                  type="number"
                  placeholder="lbs"
                  value={set.weight ?? ""}
                  onChange={(e) =>
                    onUpdateSet(set.id, {
                      weight: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  disabled={disabled}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  placeholder="reps"
                  value={set.reps ?? ""}
                  onChange={(e) =>
                    onUpdateSet(set.id, {
                      reps: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  disabled={disabled}
                  className="h-8 text-sm"
                />
                <Button
                  variant={set.completed ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    onUpdateSet(set.id, { completed: !set.completed })
                  }
                  disabled={disabled}
                >
                  <Check className="h-3 w-3" />
                </Button>
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => onDeleteSet(set.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        {!disabled && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={onAddSet}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Set
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
