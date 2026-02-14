class CreateWorkoutSessionExercises < ActiveRecord::Migration[8.1]
  def change
    create_table :workout_session_exercises do |t|
      t.integer :position
      t.references :workout_session, null: false, foreign_key: true
      t.references :exercise, null: false, foreign_key: true

      t.timestamps
    end
  end
end
