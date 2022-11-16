<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
  
// include database and object files
include_once '../config/database.php';
include_once '../objects/workoutExerciseSet.php';
  
// instantiate database and workoutExerciseSet object
$database = new Database();
$db = $database->getConnection();
  
// initialize object
$workoutExerciseSet = new WorkoutExercise($db);

// set ID property of record to read
$workoutExerciseSet->id = isset($_GET['id']) ? $_GET['id'] : null;
$workoutExerciseSet->workout_exercise_id = isset($_GET['workoutExerciseId']) ? $_GET['workoutExerciseId'] : null;

// query items
$stmt = $workoutExerciseSet->read();
$num = $stmt->rowCount();

// items array
$workoutExerciseSets_arr=array();
  
// check if more than 0 record found
if(!isset($_GET['id']) && $num>0){
    
    // retrieve our table contents
    // fetch() is faster than fetchAll()
    // http://stackoverflow.com/questions/2770630/pdofetchall-vs-pdofetch-in-a-loop
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        // extract row
        // this will make $row['name'] to
        // just $name only
        extract($row);
  
        $arr_item=array(
            "id" => $id,
            "workoutExerciseId" => $workout_exercise_id,
            "weight" => (float)$weight,
            "reps" => (int)$reps,
            "time" => (int)$time,
            "created" => $created,
            "modified" => $modified
        );
  
        array_push($workoutExerciseSets_arr, $arr_item);
    }
  
    // set response code - 200 OK
    http_response_code(200);
  
    // show workoutExerciseSet data in json format
    echo json_encode($workoutExerciseSets_arr);
    
} elseif(isset($_GET['id']) && $num==1){    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        // extract row
        // this will make $row['name'] to
        // just $name only
        extract($row);

        $workoutExerciseSets_arr=array(
            "id" => $id,
            "workoutExerciseId" => $workout_exercise_id,
            "weight" => (float)$weight,
            "reps" => (int)$reps,
            "time" => (int)$time,
            "created" => $created,
            "modified" => $modified
        );
    }

    // set response code - 200 OK
    http_response_code(200);
  
    // show workoutExerciseSet data in json format
    echo json_encode($workoutExerciseSets_arr);

} else {
  
    // set response code - 404 Not found
    // http_response_code(404);
  
    // tell the user no workoutExerciseSets found
    echo json_encode($workoutExerciseSets_arr);
}