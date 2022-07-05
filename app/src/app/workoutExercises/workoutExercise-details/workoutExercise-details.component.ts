import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../services/loading/loading.service';
import { WorkoutExercise } from '../workoutExercise.interface';
import { WorkoutExerciseService } from '../workoutExercise.service';
import { Exercise } from '../../exercises/exercise.interface';
import { ExerciseService } from '../../exercises/exercise.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-workoutExercise-details',
  templateUrl: './workoutExercise-details.component.html',
  styleUrls: ['./workoutExercise-details.component.scss']
})
export class WorkoutExerciseDetailsComponent implements OnInit {

  workoutExercise: WorkoutExercise = new WorkoutExercise();
  exercises: Exercise[] = [];
  workoutId: number = -1;
  isNew: boolean = false;
  loaded: boolean = false;

  workoutExerciseForm = new FormGroup({
    id: new FormControl(''),
    userId: new FormControl(''),
    workoutId: new FormControl(''),
    stepNumber: new FormControl(''),
    exerciseId: new FormControl(''),
    weightGoal: new FormControl(''),
    timeGoal: new FormControl(''),
    setGoal: new FormControl(''),
    repGoal: new FormControl(''),
    notes: new FormControl(''),
    modified: new FormControl(''),
    created: new FormControl('')
  });

  constructor(private loadingService: LoadingService, private workoutExerciseService: WorkoutExerciseService, private exerciseService: ExerciseService, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.isNew = params['id'] === `new`;
      this.workoutId = params['workoutId'];
      this.loadWorkoutExercise(params['id']);
    });
  }

  ngOnInit(): void {
  }

  loadWorkoutExercise(id: string) {
    this.loadingService.isLoading();

    const setupForm = (): void => {
      this.exerciseService.getExercises().subscribe((exercises: Exercise[]) => {
        this.loadingService.isLoading(false);
        this.loaded = true;
        this.exercises = exercises.map(exercise => new Exercise(undefined, exercise)).sort((a, b) => a.name > b.name ? 1 : -1);

        this.workoutExerciseForm.patchValue(this.workoutExercise);
      });
    }

    if (!this.isNew) {
      this.workoutExerciseService.getWorkoutExercise(id).subscribe((workoutExercise: WorkoutExercise) => {
        this.workoutExercise = new WorkoutExercise(workoutExercise);
        setupForm();
      });
    } else {
      this.workoutExercise = new WorkoutExercise({
        workoutId: this.workoutId
      });
      setupForm();
    }
  }

  onSave() {
    this.loadingService.isLoading();

    const workoutExercise = new WorkoutExercise(this.workoutExerciseForm.getRawValue());
    if (this.isNew) {
      this.workoutExerciseService.createWorkoutExercise(workoutExercise).subscribe(() => {
        this.loadingService.isLoading(false);
      });
    } else {
      this.workoutExerciseService.updateWorkoutExercise(workoutExercise).subscribe(() => {
        this.loadingService.isLoading(false);
      });
    }
  }

}
