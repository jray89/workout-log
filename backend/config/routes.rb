Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post "signup", to: "auth#signup"
      post "login", to: "auth#login"
      get "me", to: "auth#me"
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
