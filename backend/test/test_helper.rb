ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    parallelize(workers: :number_of_processors)

    fixtures :all
  end
end

module AuthHelpers
  def auth_headers(user)
    { "Authorization" => "Bearer #{JwtService.encode({ user_id: user.id })}" }
  end

  def json
    response.parsed_body
  end
end

class ActionDispatch::IntegrationTest
  include AuthHelpers
end
