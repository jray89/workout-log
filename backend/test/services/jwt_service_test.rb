require "test_helper"

class JwtServiceTest < ActiveSupport::TestCase
  test "round-trips a payload" do
    token = JwtService.encode({ user_id: 42 })
    assert_equal 42, JwtService.decode(token)[:user_id]
  end

  test "returns nil for an expired token" do
    token = JwtService.encode({ user_id: 42 }, exp: 1.minute.ago)
    assert_nil JwtService.decode(token)
  end

  test "returns nil for a tampered token" do
    token = JwtService.encode({ user_id: 42 })
    assert_nil JwtService.decode("#{token}x")
  end
end
