# Gravity Snake - SnakeGame in 3D
1. Instructions 

 a. Running the program: Run the index.html file in a web browser (Chrome works best) 
 
 b. Playing the game: use the WASD keys (W: rotate up, A: rotate left, S: rotate down, D: rotate right) to move the snake, and Left Click
 + Mouse Drag to move the camera
 
2. My next steps
 
 I already spent a little bit too much time on this project, making a Snake game in 3D proved to be a little more 
 challenging and time consuming than I originally anticipated. Here is what I plan on doing next and how I plan on implementing it:
 
  a. Spawn food pickup objects: I would randomly generate a 3D position and then using my gravityAttract function, snap the food to the 
  surface of the environment mesh.
  
  b. Picking up food objects: I would, in each frame, raycast from the head node to the active food pickup object, and if the 
  distance is less than the diameter of a snake Node, then I know I have intersected it.
  
  c. Checking if the Snake touched its tail: In each frame I would also raycast from the head to each tail node and check if the distance 
  is less than the diameter
  
  d. UI (Start screen, score display, restart button): Would check for a win/loss condition and display appropriate UI
