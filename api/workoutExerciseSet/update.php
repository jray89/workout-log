<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  
// include database and object files
include_once '../config/database.php';
include_once '../objects/workoutExerciseSet.php';
  
// get database connection
$database = new Database();
$db = $database->getConnection();
  
// prepare workoutExerciseSet object
$workoutExerciseSet = new WorkoutExercise($db);
  
// get id of workoutExerciseSet to be edited
$data = json_decode(file_get_contents("php://input"));
  
// set ID property of workoutExerciseSet to be edited
$workoutExerciseSet->id = $data->id;
  
// set workoutExerciseSet property values
$workoutExerciseSet->workout_exercise_id = $data->workoutExerciseId;
$workoutExerciseSet->weight = $data->weight;
$workoutExerciseSet->reps = $data->reps;
$workoutExerciseSet->time = $data->time;
$workoutExerciseSet->modified = date('Y-m-d H:i:s');

// update the workoutExerciseSet
if($workoutExerciseSet->update()){
  
    // set response code - 200 ok
    http_response_code(200);
  
    // tell the user
    echo json_encode(array("message" => "Workout exercise was updated."));
}
  
// if unable to update the workoutExerciseSet, tell the user
else{
  
    // set response code - 503 service unavailable
    http_response_code(503);
  
    // tell the user
    echo json_encode(array("message" => "Unable to update workoutExerciseSet."));
}
?>