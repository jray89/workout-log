class CreateUserPreferences < ActiveRecord::Migration[8.1]
  def change
    create_table :user_preferences do |t|
      t.integer :user_id, null: false
      t.string :theme, default: "system", null: false

      t.timestamps
    end
    add_index :user_preferences, :user_id, unique: true
    add_foreign_key :user_preferences, :users
  end
end
