import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Exercise } from '../exercises/exercise.interface';
import { LoadingService } from '../services/loading/loading.service';
import { WorkoutExercise, WorkoutExerciseSet } from './workoutExercise.interface';
import { WorkoutExerciseService } from './workoutExercise.service';
import { ExerciseService } from '../exercises/exercise.service';

@Component({
  selector: 'app-workout-exercises',
  templateUrl: './workoutExercises.component.html',
  styleUrls: ['./workoutExercises.component.scss']
})

export class WorkoutExercisesComponent implements OnInit {

  workoutExercises: WorkoutExercise[] = [];
  workoutId: number = -1;
  loaded: boolean = false;
  displayedColumns: string[] = ['stepNumber', 'weightGoal', 'timeGoal', 'setGoal', 'repGoal', 'notes'];

  constructor(private loadingService: LoadingService, private workoutExerciseService: WorkoutExerciseService, private exerciseService: ExerciseService, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.loadWorkoutExercises(params['workoutId']);
    });
  }

  ngOnInit(): void {
  }

  loadWorkoutExercises(workoutId: number): void {
    this.workoutId = workoutId;
    this.loadingService.isLoading();
    this.workoutExercises = [];
    this.workoutExerciseService.getWorkoutExercisesByWorkout(workoutId).subscribe((workoutExercises: WorkoutExercise[]) => {
      this.workoutExercises = workoutExercises.map(workoutExercise => new WorkoutExercise(workoutExercise));
      for (let i = 0; i < this.workoutExercises.length; i++) {
        this.exerciseService.getExercise(this.workoutExercises[i].exerciseId).subscribe((exercise: Exercise) => {
          this.workoutExercises[i].exercise = exercise;
          this.loadingService.isLoading(false);
          this.loaded = true;
        });
      }
    });
  }

  editSet(workoutExercise: WorkoutExercise, set: WorkoutExerciseSet) {
    console.log('workoutExercise', workoutExercise)
    console.log('set', set)

    if (workoutExercise.repGoal) {
      set.reps = set.reps === 0 ? workoutExercise.repGoal : set.reps - 1;
    }

    this.workoutExerciseService.updateWorkoutExerciseSet(set).subscribe((result: any) => {
      if (result.success) {
        console.log('yay');
      } else {
        console.log('boo');
      }
    })
  }
}
