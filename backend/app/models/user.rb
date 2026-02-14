class User < ApplicationRecord
  has_secure_password

  has_many :workout_sessions, dependent: :destroy
  has_many :exercises, foreign_key: :created_by_id, inverse_of: :created_by

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true

  normalizes :email, with: ->(email) { email.strip.downcase }
end
