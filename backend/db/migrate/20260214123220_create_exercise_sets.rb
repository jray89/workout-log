class CreateExerciseSets < ActiveRecord::Migration[8.1]
  def change
    create_table :exercise_sets do |t|
      t.integer :set_number
      t.integer :reps
      t.decimal :weight
      t.boolean :completed, default: false, null: false
      t.integer :rpe
      t.references :workout_session_exercise, null: false, foreign_key: true

      t.timestamps
    end
  end
end
