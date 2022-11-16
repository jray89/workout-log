<?php
class WorkoutExerciseSet{
  
    // database connection and table name
    private $conn;
    private $table_name = "workout_exercise_set";
  
    // object properties
    public $id;
    public $workout_exercise_id;
    public $weight;
    public $reps;
    public $time;
    public $created;
    public $modified;
  
    // constructor with $db as database connection
    public function __construct($db){
        $this->conn = $db;
    }
    
    // read products
    function read(){
        // select all query
        $query = "SELECT
                    id, workout_exercise_id, weight, time, rep, created, modified
                FROM
                    " . $this->table_name . "
                ORDER BY
                    name DESC";

        if ($this->id && $this->id != null) {
            // select one query
            $query = "SELECT
                        id, workout_exercise_id, weight, time, rep, created, modified
                    FROM
                        " . $this->table_name . "
                    WHERE id = ?
                    LIMIT
                        0,1";
        }

        if ($this->workout_exercise_id && $this->workout_exercise_id != null) {
            // select one query
            $query = "SELECT
                        id, workout_exercise_id, weight, time, rep, created, modified
                    FROM
                        " . $this->table_name . "
                    WHERE workout_exercise_id = ?";
        }
      
        // prepare query statement
        $stmt = $this->conn->prepare($query);

        if ($this->id && $this->id != null) {
            $stmt->bindParam(1, $this->id);
        }

        if ($this->workout_exercise_id && $this->workout_exercise_id != null) {
            $stmt->bindParam(1, $this->workout_exercise_id);
        }
    
        // execute query
        $stmt->execute();
      
        return $stmt;
    }

    // create exercise
    function create(){
        // query to insert record
        $query = "INSERT INTO
                    " . $this->table_name . "
                SET
                    workout_exercise_id=:workout_exercise_id, weight=:weight, time=:time, reps=:reps, created=:created, modified=:modified";
    
        // prepare query
        $stmt = $this->conn->prepare($query);
    
        // sanitize
        $this->workout_exercise_id=htmlspecialchars(strip_tags($this->workout_exercise_id));
        $this->weight=htmlspecialchars(strip_tags($this->weight));
        $this->time=htmlspecialchars(strip_tags($this->time));
        $this->reps=htmlspecialchars(strip_tags($this->reps));
        $this->modified=htmlspecialchars(strip_tags($this->modified));
        $this->created=htmlspecialchars(strip_tags($this->created));
    
        // bind values
        $stmt->bindParam(":workout_exercise_id", $this->workout_exercise_id);
        $stmt->bindParam(":weight", $this->weight);
        $stmt->bindParam(":time", $this->time);
        $stmt->bindParam(":reps", $this->reps);
        $stmt->bindParam(":modified", $this->modified);
        $stmt->bindParam(":created", $this->created);
    
        // execute query
        if($stmt->execute()){
            return true;
        }
    
        return false;
    }

    // update the product
    function update(){
        // update query
        $query = "UPDATE
                    " . $this->table_name . "
                SET
                    workout_exercise_id=:workout_exercise_id, weight=:weight, time=:time, reps=:reps, modified=:modified
                WHERE
                    id=:id";
    
        // prepare query statement
        $stmt = $this->conn->prepare($query);
    
        // sanitize
        $this->id=htmlspecialchars(strip_tags($this->id));
        $this->workout_exercise_id=htmlspecialchars(strip_tags($this->workout_exercise_id));
        $this->weight=htmlspecialchars(strip_tags($this->weight));
        $this->time=htmlspecialchars(strip_tags($this->time));
        $this->reps=htmlspecialchars(strip_tags($this->reps));
        $this->modified=htmlspecialchars(strip_tags($this->modified));
    
        // bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":workout_exercise_id", $this->workout_exercise_id);
        $stmt->bindParam(":weight", $this->weight);
        $stmt->bindParam(":time", $this->time);
        $stmt->bindParam(":reps", $this->reps);
        $stmt->bindParam(":modified", $this->modified);
    
        // execute the query
        if($stmt->execute()){
            return true;
        }
        return false;
    }
}
?>