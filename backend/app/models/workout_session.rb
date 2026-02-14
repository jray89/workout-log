class WorkoutSession < ApplicationRecord
  belongs_to :user

  has_many :workout_session_exercises, -> { order(:position) }, dependent: :destroy, inverse_of: :workout_session
  has_many :exercises, through: :workout_session_exercises

  scope :pinned, -> { where(pinned: true) }
  scope :completed, -> { where.not(completed_at: nil) }
  scope :in_progress, -> { where(completed_at: nil) }
end
