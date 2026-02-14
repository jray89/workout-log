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

      private

      def exercise_params
        params.permit(:name, :description, :muscle_group, :equipment)
      end
    end
  end
end
