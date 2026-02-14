class CreateWorkoutSessions < ActiveRecord::Migration[8.1]
  def change
    create_table :workout_sessions do |t|
      t.string :name
      t.text :notes
      t.datetime :started_at
      t.datetime :completed_at
      t.boolean :pinned, default: false, null: false
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
