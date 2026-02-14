exercises = [
  { name: "Barbell Bench Press", muscle_group: "Chest", equipment: "Barbell" },
  { name: "Incline Dumbbell Press", muscle_group: "Chest", equipment: "Dumbbell" },
  { name: "Cable Fly", muscle_group: "Chest", equipment: "Cable" },
  { name: "Barbell Back Squat", muscle_group: "Legs", equipment: "Barbell" },
  { name: "Romanian Deadlift", muscle_group: "Legs", equipment: "Barbell" },
  { name: "Leg Press", muscle_group: "Legs", equipment: "Machine" },
  { name: "Leg Curl", muscle_group: "Legs", equipment: "Machine" },
  { name: "Calf Raise", muscle_group: "Legs", equipment: "Machine" },
  { name: "Deadlift", muscle_group: "Back", equipment: "Barbell" },
  { name: "Barbell Row", muscle_group: "Back", equipment: "Barbell" },
  { name: "Pull Up", muscle_group: "Back", equipment: "Bodyweight" },
  { name: "Lat Pulldown", muscle_group: "Back", equipment: "Cable" },
  { name: "Seated Cable Row", muscle_group: "Back", equipment: "Cable" },
  { name: "Overhead Press", muscle_group: "Shoulders", equipment: "Barbell" },
  { name: "Lateral Raise", muscle_group: "Shoulders", equipment: "Dumbbell" },
  { name: "Face Pull", muscle_group: "Shoulders", equipment: "Cable" },
  { name: "Barbell Curl", muscle_group: "Biceps", equipment: "Barbell" },
  { name: "Dumbbell Curl", muscle_group: "Biceps", equipment: "Dumbbell" },
  { name: "Tricep Pushdown", muscle_group: "Triceps", equipment: "Cable" },
  { name: "Skull Crusher", muscle_group: "Triceps", equipment: "Barbell" },
  { name: "Machine Chest Fly", muscle_group: "Chest", equipment: "Machine" },
  { name: "Leg Extension", muscle_group: "Legs", equipment: "Machine" },
  { name: "Hyperextension", muscle_group: "Back", equipment: "Machine" },
  { name: "Cable Curl", muscle_group: "Biceps", equipment: "Cable" }, 
]

exercises.each do |attrs|
  Exercise.find_or_create_by!(name: attrs[:name]) do |e|
    e.muscle_group = attrs[:muscle_group]
    e.equipment = attrs[:equipment]
  end
end

puts "Seeded #{Exercise.count} exercises"
