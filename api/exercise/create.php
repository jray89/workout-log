<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  
// get database connection
include_once '../config/database.php';
  
// instantiate exercise object
include_once '../objects/exercise.php';
  
$database = new Database();
$db = $database->getConnection();
  
$exercise = new Exercise($db);
  
// get posted data
$data = json_decode(file_get_contents("php://input"));
  
// make sure data is not empty
if(
    !empty($data->user_id) &&
    !empty($data->name) &&
    !empty($data->notes)
){
  
    // set exercise property values
    $exercise->user_id = $data->user_id;
    $exercise->name = $data->name;
    $exercise->notes = $data->notes;
    $exercise->modified = date('Y-m-d H:i:s');
    $exercise->created = date('Y-m-d H:i:s');
  
    // create the exercise
    if($exercise->create()){
  
        // set response code - 201 created
        http_response_code(201);
  
        // tell the user
        echo json_encode(array("message" => "Exercise was created."));
    }
  
    // if unable to create the exercise, tell the user
    else{
  
        // set response code - 503 service unavailable
        http_response_code(503);
  
        // tell the user
        echo json_encode(array("message" => "Unable to create exercise."));
    }
}
  
// tell the user data is incomplete
else{
  
    // set response code - 400 bad request
    http_response_code(400);
  
    // tell the user
    echo json_encode(array("message" => "Unable to create exercise. Data is incomplete."));
}
?>