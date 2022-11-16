<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  
// get database connection
include_once '../config/database.php';
  
// instantiate workoutExerciseSet object
include_once '../objects/workoutExerciseSet.php';
  
$database = new Database();
$db = $database->getConnection();
  
$workoutExerciseSet = new WorkoutExercise($db);
  
// get posted data
$data = json_decode(file_get_contents("php://input"));
  
// make sure data is not empty
if(
    !empty($data->workoutExerciseId)
){
  
    // set workoutExerciseSet property values
    $workoutExerciseSet->workout_exercise_id = $data->workoutExerciseId;
    $workoutExerciseSet->weight = $data->weight;
    $workoutExerciseSet->reps = $data->reps;
    $workoutExerciseSet->time = $data->time;
    $workoutExerciseSet->modified = date('Y-m-d H:i:s');
    $workoutExerciseSet->created = date('Y-m-d H:i:s');
  
    // create the workoutExerciseSet
    if($workoutExerciseSet->create()){
  
        // set response code - 201 created
        http_response_code(201);
  
        // tell the user
        echo json_encode(array("message" => "Workout exercise was created."));
    }
  
    // if unable to create the workoutExerciseSet, tell the user
    else{
  
        // set response code - 503 service unavailable
        http_response_code(503);
  
        // tell the user
        echo json_encode(array("message" => "Unable to create workoutExerciseSet."));
    }
}
  
// tell the user data is incomplete
else{
  
    // set response code - 400 bad request
    http_response_code(400);
  
    // tell the user
    echo json_encode(array("message" => "Unable to create workoutExerciseSet. Data is incomplete."));
}
?>