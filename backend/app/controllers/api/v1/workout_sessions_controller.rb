module Api
  module V1
    class WorkoutSessionsController < ApplicationController
      before_action :set_workout_session, only: [ :show, :update, :destroy, :duplicate ]

      def index
        sessions = current_user.workout_sessions
          .includes(workout_session_exercises: [ :exercise, :exercise_sets ])
          .order(created_at: :desc)

        render json: sessions.map { |s| session_json(s) }
      end

      def show
        render json: session_json(@workout_session)
      end

      def create
        session = current_user.workout_sessions.new(session_params)
        session.started_at = Time.current

        if session.save
          render json: session_json(session), status: :created
        else
          render json: { errors: session.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @workout_session.update(session_params)
          render json: session_json(@workout_session)
        else
          render json: { errors: @workout_session.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @workout_session.destroy
        head :no_content
      end

      def duplicate
        new_session = current_user.workout_sessions.new(
          name: @workout_session.name,
          started_at: Time.current
        )

        if new_session.save
          @workout_session.workout_session_exercises.includes(:exercise_sets).each do |wse|
            new_wse = new_session.workout_session_exercises.create!(
              exercise_id: wse.exercise_id,
              position: wse.position
            )
            wse.exercise_sets.each do |es|
              new_wse.exercise_sets.create!(
                set_number: es.set_number,
                reps: es.reps,
                weight: es.weight,
                completed: false
              )
            end
          end

          render json: session_json(new_session.reload), status: :created
        else
          render json: { errors: new_session.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_workout_session
        @workout_session = current_user.workout_sessions
          .includes(workout_session_exercises: [ :exercise, :exercise_sets ])
          .find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Workout session not found" }, status: :not_found
      end

      def session_params
        params.permit(:name, :notes, :pinned, :completed_at)
      end

      def session_json(session)
        {
          id: session.id,
          name: session.name,
          notes: session.notes,
          started_at: session.started_at,
          completed_at: session.completed_at,
          pinned: session.pinned,
          created_at: session.created_at,
          exercises: session.workout_session_exercises.map { |wse|
            {
              id: wse.id,
              position: wse.position,
              exercise: {
                id: wse.exercise.id,
                name: wse.exercise.name,
                muscle_group: wse.exercise.muscle_group,
                equipment: wse.exercise.equipment
              },
              sets: wse.exercise_sets.map { |es|
                {
                  id: es.id,
                  set_number: es.set_number,
                  reps: es.reps,
                  weight: es.weight&.to_f,
                  completed: es.completed,
                  rpe: es.rpe
                }
              }
            }
          }
        }
      end
    end
  end
end
