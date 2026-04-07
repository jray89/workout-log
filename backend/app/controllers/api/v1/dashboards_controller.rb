module Api
  module V1
    class DashboardsController < ApplicationController
      def show
        render json: {
          streak:       compute_streak,
          weekly_stats: compute_weekly_stats,
          weekly_goal:  current_user.user_preference&.weekly_goal || 3,
          total_workouts: current_user.workout_sessions.completed.count,
          recent_prs:   compute_recent_prs,
          muscle_groups: compute_muscle_groups,
          activity:     compute_activity
        }
      end

      private

      # ---------------------------------------------------------------------------
      # Streak (weekly)
      # A streak = consecutive calendar weeks where completed workout count >= goal.
      # The current week counts if it has already met the goal; if it's still in
      # progress and hasn't met goal yet we don't count it but also don't break
      # the streak — it's still alive.
      # ---------------------------------------------------------------------------
      def compute_streak
        goal = current_user.user_preference&.weekly_goal || 3

        # Build { "cwyear-cweek" => count } from all completed sessions
        week_counts = current_user.workout_sessions.completed
          .pluck(:completed_at)
          .each_with_object(Hash.new(0)) do |dt, h|
            d = dt.to_date
            h["#{d.cwyear}-#{d.cweek}"] += 1
          end

        today = Date.today
        this_week_key = "#{today.cwyear}-#{today.cweek}"

        current_streak = 0
        # Monday of the week before current
        week_cursor = today.beginning_of_week - 7

        # If this week already met goal, count it and start walking back from last week
        if (week_counts[this_week_key] || 0) >= goal
          current_streak = 1
          # week_cursor already points to last week
        end
        # else: this week in progress, streak may still be alive — just start from last week

        # Walk backwards through fully elapsed weeks
        loop do
          key = "#{week_cursor.cwyear}-#{week_cursor.cweek}"
          break if (week_counts[key] || 0) < goal
          current_streak += 1
          week_cursor -= 7
        end

        { current: current_streak, longest: compute_longest_weekly_streak(week_counts, goal) }
      end

      def compute_longest_weekly_streak(week_counts, goal)
        qualifying = week_counts
          .select { |_, count| count >= goal }
          .keys
          .map { |k| year, week = k.split("-").map(&:to_i); Date.commercial(year, week, 1) }
          .sort

        return 0 if qualifying.empty?

        longest = 1
        current = 1
        qualifying.each_cons(2) do |a, b|
          if (b - a) == 7
            current += 1
            longest = [longest, current].max
          else
            current = 1
          end
        end
        longest
      end

      # ---------------------------------------------------------------------------
      # Weekly stats — this week vs last week (workouts + volume)
      # ---------------------------------------------------------------------------
      def compute_weekly_stats
        today = Date.today
        this_week_start = today.beginning_of_week
        last_week_start = this_week_start - 7

        this_week = completed_sessions_in_range(this_week_start, this_week_start + 6)
        last_week = completed_sessions_in_range(last_week_start, last_week_start + 6)

        {
          this_week_count:  this_week.count,
          last_week_count:  last_week.count,
          this_week_volume: compute_volume_for_sessions(this_week),
          last_week_volume: compute_volume_for_sessions(last_week)
        }
      end

      def completed_sessions_in_range(start_date, end_date)
        current_user.workout_sessions.completed
          .where(completed_at: start_date.beginning_of_day..end_date.end_of_day)
      end

      def compute_volume_for_sessions(sessions)
        ExerciseSet
          .joins(workout_session_exercise: :workout_session)
          .where(workout_session_exercises: { workout_session_id: sessions.select(:id) })
          .where(completed: true)
          .where.not(weight: nil, reps: nil)
          .sum("weight * reps")
          .to_f
      end

      # ---------------------------------------------------------------------------
      # Recent PRs — exercises where the user hit a new max weight in the last 30 days
      # ---------------------------------------------------------------------------
      def compute_recent_prs
        window_start = 30.days.ago

        # Find exercises with recent max weights (last 30 days)
        recent_exercises = current_user.workout_sessions.completed
          .where("completed_at >= ?", window_start)
          .joins(workout_session_exercises: [ :exercise, :exercise_sets ])
          .where(exercise_sets: { completed: true })
          .where.not(exercise_sets: { weight: nil })
          .group("exercises.id", "exercises.name")
          .select("exercises.id, exercises.name, MAX(exercise_sets.weight) as recent_max, MAX(workout_sessions.completed_at) as pr_date")

        prs = []
        recent_exercises.each do |row|
          prior_max = ExerciseSet
            .joins(workout_session_exercise: :workout_session)
            .where(
              "workout_sessions.user_id = ? AND workout_sessions.completed_at < ? AND workout_session_exercises.exercise_id = ? AND exercise_sets.completed = ?",
              current_user.id, window_start, row.id, true
            )
            .where.not(weight: nil)
            .maximum(:weight) || 0

          if row.recent_max.to_f > prior_max.to_f
            prs << {
              exercise_name: row.name,
              weight:        row.recent_max.to_f,
              date:          row.pr_date.to_date.to_s
            }
          end
        end

        prs.sort_by { |pr| pr[:date] }.reverse.first(5)
      end

      # ---------------------------------------------------------------------------
      # Muscle group distribution — completed sessions in last 30 days
      # ---------------------------------------------------------------------------
      def compute_muscle_groups
        current_user.workout_sessions.completed
          .where("completed_at >= ?", 30.days.ago)
          .joins(workout_session_exercises: :exercise)
          .where.not(exercises: { muscle_group: nil })
          .group("exercises.muscle_group")
          .count
          .sort_by { |_, v| -v }
          .first(8)
          .map { |mg, count| { muscle_group: mg, count: count } }
      end

      # ---------------------------------------------------------------------------
      # Activity heatmap — one entry per calendar day for the past 91 days
      # ---------------------------------------------------------------------------
      def compute_activity
        start_time = 91.days.ago.utc

        counts = current_user.workout_sessions.completed
          .where(completed_at: start_time..Time.now.utc)
          .pluck(:completed_at)
          .each_with_object(Hash.new(0)) { |ts, h| h[ts.utc.to_date.to_s] += 1 }
      
        start_date = start_time.to_date
        (start_date..Date.current).map do |d|
          { date: d.to_s, count: counts[d.to_s] || 0 }
        end
      end
    end
  end
end
