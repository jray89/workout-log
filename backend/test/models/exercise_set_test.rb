require "test_helper"

class ExerciseSetTest < ActiveSupport::TestCase
  setup { @wse = workout_session_exercises(:alice_bench) }

  test "requires a positive set number" do
    assert_not @wse.exercise_sets.new(set_number: 0).valid?
    assert @wse.exercise_sets.new(set_number: 2).valid?
  end

  test "rejects non-positive reps but allows them to be blank" do
    assert_not @wse.exercise_sets.new(set_number: 2, reps: 0).valid?
    assert @wse.exercise_sets.new(set_number: 2, reps: nil).valid?
  end

  test "rejects negative weight but allows bodyweight (zero)" do
    assert_not @wse.exercise_sets.new(set_number: 2, weight: -5).valid?
    assert @wse.exercise_sets.new(set_number: 2, weight: 0).valid?
  end
end
