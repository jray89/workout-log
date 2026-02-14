module Api
  module V1
    class ExerciseSetsController < ApplicationController
      before_action :set_workout_session_exercise

      def create
        next_number = (@wse.exercise_sets.maximum(:set_number) || 0) + 1
        set = @wse.exercise_sets.new(set_params)
        set.set_number = next_number

        if set.save
          render json: set_json(set), status: :created
        else
          render json: { errors: set.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        set = @wse.exercise_sets.find(params[:id])

        if set.update(set_params)
          render json: set_json(set)
        else
          render json: { errors: set.errors.full_messages }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Set not found" }, status: :not_found
      end

      def destroy
        set = @wse.exercise_sets.find(params[:id])
        set.destroy
        head :no_content
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Set not found" }, status: :not_found
      end

      private

      def set_workout_session_exercise
        session = current_user.workout_sessions.find(params[:workout_session_id])
        @wse = session.workout_session_exercises.find(params[:workout_session_exercise_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Not found" }, status: :not_found
      end

      def set_params
        params.permit(:reps, :weight, :completed, :rpe)
      end

      def set_json(set)
        {
          id: set.id,
          set_number: set.set_number,
          reps: set.reps,
          weight: set.weight&.to_f,
          completed: set.completed,
          rpe: set.rpe
        }
      end
    end
  end
end
