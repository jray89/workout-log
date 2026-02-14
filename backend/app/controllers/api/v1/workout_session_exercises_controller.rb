module Api
  module V1
    class WorkoutSessionExercisesController < ApplicationController
      before_action :set_workout_session

      def create
        next_position = (@workout_session.workout_session_exercises.maximum(:position) || 0) + 1
        wse = @workout_session.workout_session_exercises.new(
          exercise_id: params[:exercise_id],
          position: next_position
        )

        if wse.save
          render json: workout_session_exercise_json(wse), status: :created
        else
          render json: { errors: wse.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        wse = @workout_session.workout_session_exercises.find(params[:id])
        wse.destroy
        head :no_content
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Exercise not found in session" }, status: :not_found
      end

      private

      def set_workout_session
        @workout_session = current_user.workout_sessions.find(params[:workout_session_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Workout session not found" }, status: :not_found
      end

      def workout_session_exercise_json(wse)
        {
          id: wse.id,
          position: wse.position,
          exercise: {
            id: wse.exercise.id,
            name: wse.exercise.name,
            muscle_group: wse.exercise.muscle_group,
            equipment: wse.exercise.equipment
          },
          sets: []
        }
      end
    end
  end
end
