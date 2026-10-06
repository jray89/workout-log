require "test_helper"

class AuthTest < ActionDispatch::IntegrationTest
  test "signup creates a user and returns a usable token" do
    assert_difference "User.count", 1 do
      post "/api/v1/signup", params: {
        name: "Carol", email: "carol@example.com",
        password: "password123", password_confirmation: "password123"
      }, as: :json
    end
    assert_response :created
    assert_equal "carol@example.com", json.dig("user", "email")

    get "/api/v1/me", headers: { "Authorization" => "Bearer #{json["token"]}" }
    assert_response :success
    assert_equal "Carol", json.dig("user", "name")
  end

  test "signup rejects mismatched password confirmation" do
    assert_no_difference "User.count" do
      post "/api/v1/signup", params: {
        name: "Carol", email: "carol@example.com",
        password: "password123", password_confirmation: "different"
      }, as: :json
    end
    assert_response :unprocessable_entity
    assert json["errors"].any?
  end

  test "login succeeds with correct credentials and normalizes email" do
    post "/api/v1/login", params: { email: " ALICE@example.com", password: "password123" }, as: :json
    assert_response :success
    assert json["token"].present?
    assert_equal users(:alice).id, json.dig("user", "id")
  end

  test "login fails with a wrong password" do
    post "/api/v1/login", params: { email: "alice@example.com", password: "wrong" }, as: :json
    assert_response :unauthorized
    assert_nil json["token"]
  end

  test "protected endpoints require a token" do
    get "/api/v1/me"
    assert_response :unauthorized

    get "/api/v1/workout_sessions", headers: { "Authorization" => "Bearer not-a-real-token" }
    assert_response :unauthorized
  end

  test "an expired token is rejected" do
    token = JwtService.encode({ user_id: users(:alice).id }, exp: 1.minute.ago)
    get "/api/v1/me", headers: { "Authorization" => "Bearer #{token}" }
    assert_response :unauthorized
  end
end
