class Exercise < ApplicationRecord
  belongs_to :created_by, class_name: "User", optional: true

  has_many :workout_session_exercises, dependent: :destroy

  validates :name, presence: true
end
