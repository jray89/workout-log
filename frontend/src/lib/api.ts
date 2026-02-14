const API_BASE = "/api/v1";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.errors?.join(", ") || "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Auth
  signup: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    request<{ token: string; user: User }>("/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: User }>("/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request<{ user: User }>("/me"),

  // Exercises
  getExercises: () => request<Exercise[]>("/exercises"),

  createExercise: (data: Partial<Exercise>) =>
    request<Exercise>("/exercises", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getExerciseHistory: (exerciseId: number) =>
    request<ExerciseHistoryEntry[]>(`/exercises/${exerciseId}/history`),

  // Workout Sessions
  getWorkoutSessions: () => request<WorkoutSession[]>("/workout_sessions"),

  getWorkoutSession: (id: number) =>
    request<WorkoutSession>(`/workout_sessions/${id}`),

  createWorkoutSession: (data: { name?: string }) =>
    request<WorkoutSession>("/workout_sessions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateWorkoutSession: (id: number, data: Partial<WorkoutSession>) =>
    request<WorkoutSession>(`/workout_sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteWorkoutSession: (id: number) =>
    request<void>(`/workout_sessions/${id}`, { method: "DELETE" }),

  duplicateWorkoutSession: (id: number) =>
    request<WorkoutSession>(`/workout_sessions/${id}/duplicate`, {
      method: "POST",
    }),

  // Workout Session Exercises
  addExerciseToSession: (sessionId: number, exerciseId: number) =>
    request<WorkoutSessionExercise>(
      `/workout_sessions/${sessionId}/workout_session_exercises`,
      {
        method: "POST",
        body: JSON.stringify({ exercise_id: exerciseId }),
      }
    ),

  removeExerciseFromSession: (sessionId: number, wseId: number) =>
    request<void>(
      `/workout_sessions/${sessionId}/workout_session_exercises/${wseId}`,
      { method: "DELETE" }
    ),

  // Exercise Sets
  addSet: (sessionId: number, wseId: number, data?: Partial<ExerciseSet>) =>
    request<ExerciseSet>(
      `/workout_sessions/${sessionId}/workout_session_exercises/${wseId}/exercise_sets`,
      {
        method: "POST",
        body: JSON.stringify(data || {}),
      }
    ),

  updateSet: (
    sessionId: number,
    wseId: number,
    setId: number,
    data: Partial<ExerciseSet>
  ) =>
    request<ExerciseSet>(
      `/workout_sessions/${sessionId}/workout_session_exercises/${wseId}/exercise_sets/${setId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    ),

  deleteSet: (sessionId: number, wseId: number, setId: number) =>
    request<void>(
      `/workout_sessions/${sessionId}/workout_session_exercises/${wseId}/exercise_sets/${setId}`,
      { method: "DELETE" }
    ),
};

// Types
export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Exercise {
  id: number;
  name: string;
  description?: string;
  muscle_group: string;
  equipment: string;
  custom: boolean;
}

export interface ExerciseSet {
  id: number;
  set_number: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
  rpe: number | null;
}

export interface WorkoutSessionExercise {
  id: number;
  position: number;
  exercise: Exercise;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: number;
  name: string | null;
  notes: string | null;
  started_at: string;
  completed_at: string | null;
  pinned: boolean;
  created_at: string;
  exercises: WorkoutSessionExercise[];
}

export interface ExerciseHistoryEntry {
  date: string;
  max_weight: number;
  workout_session_id: number;
}
