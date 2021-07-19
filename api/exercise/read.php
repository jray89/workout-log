<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
  
// include database and object files
include_once '../config/database.php';
include_once '../objects/exercise.php';
  
// instantiate database and exercise object
$database = new Database();
$db = $database->getConnection();
  
// initialize object
$exercise = new Exercise($db);

// set ID property of record to read
$exercise->id = isset($_GET['id']) ? $_GET['id'] : null;

// query items
$stmt = $exercise->read();
$num = $stmt->rowCount();
  
// check if more than 0 record found
if($num>0){
  
    // items array
    $exercises_arr=array();
    $exercises_arr["records"]=array();
  
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
            "user_id" => $user_id,
            "name" => $name,
            "notes" => html_entity_decode($notes),
            "created" => $created,
            "modified" => $modified,

        );
  
        array_push($exercises_arr["records"], $arr_item);
    }
  
    // set response code - 200 OK
    http_response_code(200);
  
    // show exercise data in json format
    echo json_encode($exercises_arr);
    
} else {
  
    // set response code - 404 Not found
    http_response_code(404);
  
    // tell the user no exercises found
    echo json_encode(
        array("message" => "No exercises found.")
    );
}