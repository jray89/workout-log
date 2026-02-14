class ExerciseSet < ApplicationRecord
  belongs_to :workout_session_exercise

  validates :set_number, presence: true, numericality: { greater_than: 0 }
  validates :reps, numericality: { greater_than: 0 }, allow_nil: true
  validates :weight, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
end
