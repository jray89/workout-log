require "test_helper"

# Every resource is reached through current_user, so another user's
# records should be indistinguishable from records that don't exist.
class AuthorizationTest < ActionDispatch::IntegrationTest
  setup do
    @bob = users(:bob)
    @alice_session = workout_sessions(:alice_push)
    @alice_wse = workout_session_exercises(:alice_bench)
    @alice_set = exercise_sets(:alice_bench_1)
  end

  test "cannot read, update, duplicate or delete another user's session" do
    get "/api/v1/workout_sessions/#{@alice_session.id}", headers: auth_headers(@bob)
    assert_response :not_found

    patch "/api/v1/workout_sessions/#{@alice_session.id}", params: { name: "Hijacked" },
      headers: auth_headers(@bob), as: :json
    assert_response :not_found

    post "/api/v1/workout_sessions/#{@alice_session.id}/duplicate", headers: auth_headers(@bob)
    assert_response :not_found

    delete "/api/v1/workout_sessions/#{@alice_session.id}", headers: auth_headers(@bob)
    assert_response :not_found

    assert_equal "Push Day", @alice_session.reload.name
  end

  test "cannot modify sets inside another user's session" do
    path = "/api/v1/workout_sessions/#{@alice_session.id}/workout_session_exercises/#{@alice_wse.id}/exercise_sets"

    post path, params: { reps: 1 }, headers: auth_headers(@bob), as: :json
    assert_response :not_found

    patch "#{path}/#{@alice_set.id}", params: { weight: 999 }, headers: auth_headers(@bob), as: :json
    assert_response :not_found
    assert_equal 135, @alice_set.reload.weight

    delete "#{path}/#{@alice_set.id}", headers: auth_headers(@bob)
    assert_response :not_found
    assert ExerciseSet.exists?(@alice_set.id)
  end

  test "only admins can add exercises to the shared library" do
    post "/api/v1/exercises", params: { name: "Deadlift" }, headers: auth_headers(@bob), as: :json
    assert_response :forbidden

    post "/api/v1/exercises", params: { name: "Deadlift" }, headers: auth_headers(users(:admin)), as: :json
    assert_response :created
  end
end
