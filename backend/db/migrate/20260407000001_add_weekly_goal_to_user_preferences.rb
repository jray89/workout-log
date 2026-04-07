class AddWeeklyGoalToUserPreferences < ActiveRecord::Migration[8.1]
  def change
    add_column :user_preferences, :weekly_goal, :integer, default: 3, null: false
  end
end
