class WorkoutSessionExercise < ApplicationRecord
  belongs_to :workout_session
  belongs_to :exercise

  has_many :exercise_sets, -> { order(:set_number) }, dependent: :destroy, inverse_of: :workout_session_exercise
end
