require "test_helper"

class WorkoutSessionsTest < ActionDispatch::IntegrationTest
  setup do
    @alice = users(:alice)
    @session = workout_sessions(:alice_push)
  end

  test "index lists only the current user's sessions" do
    get "/api/v1/workout_sessions", headers: auth_headers(@alice)
    assert_response :success
    assert_equal [ @session.id ], json.map { |s| s["id"] }
  end

  test "show includes exercises and sets" do
    get "/api/v1/workout_sessions/#{@session.id}", headers: auth_headers(@alice)
    assert_response :success
    exercise = json["exercises"].first
    assert_equal "Bench Press", exercise.dig("exercise", "name")
    assert_equal 135.0, exercise["sets"].first["weight"]
  end

  test "create, update and destroy a session" do
    post "/api/v1/workout_sessions", params: { name: "Run", session_type: "cardio", distance: 3.1 },
      headers: auth_headers(@alice), as: :json
    assert_response :created
    id = json["id"]
    assert_equal 3.1, json["distance"]

    patch "/api/v1/workout_sessions/#{id}", params: { pinned: true, notes: "Felt good" },
      headers: auth_headers(@alice), as: :json
    assert_response :success
    assert json["pinned"]
    assert_equal "Felt good", json["notes"]

    assert_difference "WorkoutSession.count", -1 do
      delete "/api/v1/workout_sessions/#{id}", headers: auth_headers(@alice)
    end
    assert_response :no_content
  end

  test "duplicate copies exercises and resets set completion" do
    assert_difference "WorkoutSession.count", 1 do
      post "/api/v1/workout_sessions/#{@session.id}/duplicate", headers: auth_headers(@alice)
    end
    assert_response :created
    assert_not_equal @session.id, json["id"]
    sets = json["exercises"].first["sets"]
    assert_equal [ 8 ], sets.map { |s| s["reps"] }
    assert_equal [ false ], sets.map { |s| s["completed"] }
  end
end
