class AddSessionTypeAndDistanceToWorkoutSessions < ActiveRecord::Migration[8.1]
  def change
    add_column :workout_sessions, :session_type, :string, null: false, default: "strength"
    add_column :workout_sessions, :distance, :decimal
  end
end
