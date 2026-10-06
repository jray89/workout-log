require "test_helper"

class UserTest < ActiveSupport::TestCase
  def build_user(**attrs)
    User.new({ name: "Carol", email: "carol@example.com", password: "password123" }.merge(attrs))
  end

  test "valid with name, email and password" do
    assert build_user.valid?
  end

  test "normalizes email to lowercase without surrounding whitespace" do
    assert_equal "carol@example.com", build_user(email: "  Carol@Example.COM ").email
  end

  test "rejects a malformed email" do
    assert_not build_user(email: "not-an-email").valid?
  end

  test "rejects a duplicate email regardless of case" do
    user = build_user(email: "ALICE@example.com")
    assert_not user.valid?
    assert_includes user.errors[:email], "has already been taken"
  end

  test "requires a name" do
    assert_not build_user(name: "").valid?
  end
end
