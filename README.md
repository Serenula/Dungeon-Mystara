# ProjectOne

## In the beginning

1. Created a event listener → DOM content loaded to ensure that my script runs after the DOM is fully loaded
   1. board
   2. colours for the square
   3. start square
      1. declared it as always index 0
   4. finish square
      1. declared it as final index of the flow of the game. Currently set at 15

## Creation of Board

1. Creation of Perimeter
   1. To prevent the code from reading the board like a chess board I have to create a perimeter of indices
   2. Created the perimeter index where the flow of the game needs to be from

      ```
       const perimeterIndices = [
          0,
          1,
          2,
          3,
          4, // Top row
          9,
          14,
          19, // Right column (excluding corners)
          24,
          23,
          22,
          21,
          20, // Bottom row
          15,
          10,
          5, // Left column (excluding corners)
        ];
      ```
2. Creation of Position
   1. To determine the position of the perimeter, I need to create the Row and Column to match

      ```
       const positions = [
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 4],
          [1, 5], // Top row
          [2, 5],
          [3, 5],
          [4, 5], // Right column
          [5, 5],
          [5, 4],
          [5, 3],
          [5, 2],
          [5, 1], // Bottom row
          [4, 1],
          [3, 1],
          [2, 1], // Left column
        ];
      ```
3. Creation of the loop and events on the squares
   1. This is where I start to give the squares their uses
   2. I created a new div element for each square to allow me to customise each square by position for the game logic later

      ```
      perimeterIndices.forEach((index, i) => {
          const square = document.createElement("div");
          square.classList.add("square");
      ```

   3. Colouring the squares
      1. Using an If else loop, I determine where START and FINISH is and for the other squares that are not either one of those, they will receive colour in alternating fashion via i % 2

         ```

             if (i === startSquareIndex) {
               square.classList.add("gravel-grey");
               square.innerText = "START";
             } else if (i === finishSquareIndex) {
               square.classList.add("green");
               square.innerText = "FINISH";
               square.dataset.event = "FINISH"; //Assign the FINISH event
             } else {
               square.classList.add(colors[i % 2]);

               // Set the grid position
               const [row, col] = positions[i];
               square.dataset.position = `${row}-${col}`; // Store the position data

               // Hide the event text initially
               square.innerText = "";
             }
         ```
   4. Storing of position data

      ```
      // Set the grid position
            const [row, col] = positions[i];
            square.dataset.position = `${row}-${col}`;
      ```

      1. This is to ensure that the grid position for each square is set.
      2. Starts by destructuring to extract the row and column values from the position array for the current square
      3. then dataset allows the code to set and get any custom data from that square
      4. ending with template literal that combines the row and column values into a single string
      5. This gives me the freedom to check on a squares position when the player moves

   5. Hiding of event text
      1. After which, as events are created later, I need to hide the event related text so the player won’t know what events lie in each square
   6. Setting in the grid position

      ```
      // Set the grid position
          const [row, col] = positions[i];
          square.style.gridArea = `${row} / ${col} / span 1 / span 1`;
      ```

      1. Somewhat same as position data, this one manages the CSS “grid area” property of the square element
      2. Template literal as with position data but included span to ensure it spans 1 “block” only

   7. Generation of random events
      1. As each square will contain an event, I wanted the events to be randomly generated
      2. I declared a constant called event and connect it to a function called getRandomEvent() which will be created later
      3. Connecting the square dataset event to this event and append the event to the squares
