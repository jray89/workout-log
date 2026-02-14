module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [ :signup, :login ]

      def signup
        user = User.new(signup_params)

        if user.save
          token = JwtService.encode({ user_id: user.id })
          render json: { token: token, user: user_json(user) }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def login
        user = User.find_by(email: User.normalize_value_for(:email, params[:email]))

        if user&.authenticate(params[:password])
          token = JwtService.encode({ user_id: user.id })
          render json: { token: token, user: user_json(user) }
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def me
        render json: { user: user_json(current_user) }
      end

      private

      def signup_params
        params.permit(:email, :password, :password_confirmation, :name)
      end

      def user_json(user)
        { id: user.id, email: user.email, name: user.name }
      end
    end
  end
end
