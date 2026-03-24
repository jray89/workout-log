class UserPreference < ApplicationRecord
  belongs_to :user

  THEMES = %w[light dark system].freeze

  validates :theme, inclusion: { in: THEMES }
end
