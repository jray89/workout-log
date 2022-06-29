<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  
// include database and object files
include_once '../config/database.php';
include_once '../objects/workout.php';
  
// get database connection
$database = new Database();
$db = $database->getConnection();
  
// prepare workout object
$workout = new Workout($db);
  
// get id of workout to be edited
$data = json_decode(file_get_contents("php://input"));
  
// set ID property of workout to be edited
$workout->id = $data->id;
  
// set workout property values
$workout->user_id = $data->userId;
$workout->name = $data->name;
$workout->workout_date = $data->workoutDate;
$workout->notes = $data->notes;
$workout->modified = date('Y-m-d H:i:s');

// update the workout
if($workout->update()){
  
    // set response code - 200 ok
    http_response_code(200);
  
    // tell the user
    echo json_encode(array("message" => "Workout was updated."));
}
  
// if unable to update the workout, tell the user
else{
  
    // set response code - 503 service unavailable
    http_response_code(503);
  
    // tell the user
    echo json_encode(array("message" => "Unable to update workout."));
}
?>