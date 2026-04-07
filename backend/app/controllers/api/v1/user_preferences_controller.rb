module Api
  module V1
    class UserPreferencesController < ApplicationController
      def show
        preference = current_user.user_preference || UserPreference.new(theme: "system")
        render json: preference_json(preference)
      end

      def update
        preference = current_user.user_preference || current_user.build_user_preference
        if preference.update(preference_params)
          render json: preference_json(preference)
        else
          render json: { errors: preference.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def preference_params
        params.permit(:theme, :weekly_goal)
      end

      def preference_json(preference)
        { theme: preference.theme, weekly_goal: preference.weekly_goal || 3 }
      end
    end
  end
end
