import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { WorkoutExercise, WorkoutExerciseSet } from './workoutExercise.interface';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkoutExerciseService {

  constructor(private http: HttpClient) { }

  getWorkoutExercises(): Observable<WorkoutExercise[]> {
    return this.http.get<WorkoutExercise[]>(`${environment.api}/workoutExercise/read.php`);
  }

  getWorkoutExercisesByWorkout(workoutId: number): Observable<WorkoutExercise[]> {
    return this.http.get<WorkoutExercise[]>(`${environment.api}/workoutExercise/read.php?workoutId=${workoutId}`);
  }

  getWorkoutExercisesByExercise(exerciseId: number): Observable<WorkoutExercise[]> {
    return this.http.get<WorkoutExercise[]>(`${environment.api}/workoutExercise/read.php?exerciseId=${exerciseId}`);
  }

  getWorkoutExercise(workoutExerciseId: string): Observable<WorkoutExercise> {
    return this.http.get<WorkoutExercise>(`${environment.api}/workoutExercise/read.php?id=${workoutExerciseId}`);
  }

  createWorkoutExercise(workoutExercise: WorkoutExercise): Observable<Object> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=UTF-8');
    return this.http.post(`${environment.api}/workoutExercise/create.php`, workoutExercise, { headers });
  }

  updateWorkoutExercise(workoutExercise: WorkoutExercise): Observable<Object> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=UTF-8');
    return this.http.put(`${environment.api}/workoutExercise/update.php`, workoutExercise, { headers });
  }

  updateWorkoutExerciseSet(workoutExerciseSet: WorkoutExerciseSet): Observable<Object> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=UTF-8');
    return this.http.put(`${environment.api}/workoutExerciseSet/update.php`, workoutExerciseSet, { headers });
  }
}
