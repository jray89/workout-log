Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post "signup", to: "auth#signup"
      post "login", to: "auth#login"
      get "me", to: "auth#me"

      resources :exercises, only: [ :index, :create ] do
        get :history, on: :member
      end

      resources :workout_sessions, only: [ :index, :show, :create, :update, :destroy ] do
        post :duplicate, on: :member

        resources :workout_session_exercises, only: [ :create, :destroy ] do
          resources :exercise_sets, only: [ :create, :update, :destroy ]
        end
      end
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check

  # SPA fallback — serve index.html for root and any non-API routes
  # (on Railway/Puma where .htaccess is not supported)
  root "fallback#index"
  get "*path", to: "fallback#index", constraints: ->(req) { !req.path.start_with?("/api/") }
end
