module Api
  module V1
    class ExercisesController < ApplicationController
      def index
        exercises = Exercise.order(:muscle_group, :name)
        render json: exercises
      end

      def create
        exercise = Exercise.new(exercise_params)
        exercise.custom = true
        exercise.created_by = current_user

        if exercise.save
          render json: exercise, status: :created
        else
          render json: { errors: exercise.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def history
        exercise = Exercise.find(params[:id])

        # Get all completed workout sessions for the current user that include this exercise
        history_data = current_user.workout_sessions
          .completed
          .joins(:workout_session_exercises)
          .where(workout_session_exercises: { exercise_id: exercise.id })
          .order(:completed_at)
          .map do |session|
            # Find the workout_session_exercise for this exercise in this session
            wse = session.workout_session_exercises.find_by(exercise_id: exercise.id)

            # Calculate max weight from all sets in this session for this exercise
            max_weight = wse.exercise_sets.where.not(weight: nil).maximum(:weight)

            # Only include if there's a max weight recorded
            if max_weight.present?
              {
                date: session.created_at.to_date,
                max_weight: max_weight,
                workout_session_id: session.id
              }
            end
          end.compact

        render json: history_data
      end

      private

      def exercise_params
        params.permit(:name, :description, :muscle_group, :equipment)
      end
    end
  end
end
