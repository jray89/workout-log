class CreateExercises < ActiveRecord::Migration[8.1]
  def change
    create_table :exercises do |t|
      t.string :name, null: false
      t.text :description
      t.string :muscle_group
      t.string :equipment
      t.boolean :custom, default: false, null: false
      t.integer :created_by_id

      t.timestamps
    end

    add_index :exercises, :name
  end
end
