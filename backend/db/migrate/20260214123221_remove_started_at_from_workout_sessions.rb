class RemoveStartedAtFromWorkoutSessions < ActiveRecord::Migration[8.1]
  def up
    # Safety: Update created_at from started_at for any records where started_at is earlier
    execute <<-SQL
      UPDATE workout_sessions
      SET created_at = started_at
      WHERE started_at IS NOT NULL
      AND started_at < created_at
    SQL

    remove_column :workout_sessions, :started_at
  end

  def down
    add_column :workout_sessions, :started_at, :datetime

    # Restore started_at from created_at
    execute <<-SQL
      UPDATE workout_sessions
      SET started_at = created_at
    SQL
  end
end
