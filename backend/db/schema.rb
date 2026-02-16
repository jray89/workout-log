# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_02_16_125234) do
  create_table "exercise_sets", force: :cascade do |t|
    t.boolean "completed", default: false, null: false
    t.datetime "created_at", null: false
    t.integer "reps"
    t.integer "rpe"
    t.integer "set_number"
    t.datetime "updated_at", null: false
    t.decimal "weight"
    t.integer "workout_session_exercise_id", null: false
    t.index ["workout_session_exercise_id"], name: "index_exercise_sets_on_workout_session_exercise_id"
  end

  create_table "exercises", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "created_by_id"
    t.boolean "custom", default: false, null: false
    t.text "description"
    t.string "equipment"
    t.string "muscle_group"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_exercises_on_name"
  end

  create_table "users", force: :cascade do |t|
    t.boolean "admin", default: false, null: false
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "name", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "workout_session_exercises", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "exercise_id", null: false
    t.integer "position"
    t.datetime "updated_at", null: false
    t.integer "workout_session_id", null: false
    t.index ["exercise_id"], name: "index_workout_session_exercises_on_exercise_id"
    t.index ["workout_session_id"], name: "index_workout_session_exercises_on_workout_session_id"
  end

  create_table "workout_sessions", force: :cascade do |t|
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.string "name"
    t.text "notes"
    t.boolean "pinned", default: false, null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_workout_sessions_on_user_id"
  end

  add_foreign_key "exercise_sets", "workout_session_exercises"
  add_foreign_key "workout_session_exercises", "exercises"
  add_foreign_key "workout_session_exercises", "workout_sessions"
  add_foreign_key "workout_sessions", "users"
end
