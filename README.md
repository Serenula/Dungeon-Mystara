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

## Creation of the gameplay logic (Player movement square related events)

### rollDie - the powers that move the player

1. I honestly started with the rollDie function where the results are based on a single die of 6 faces thus the math.
2. I also included Math.random to ensure the results are randomised
3. Now that the dice and give a random number between 1-6, it needs to be used to tell my game where the player moves to. With that, playerPosition is created
4. rollDie works through index-based approach, thats why I did not need to reference the board nor grid matrix above.
5. With playerPosition, I needed to tell the game where the player is by index and to update the game using the rollResults
   1. current position
      1. tells where the player is currently
   2. new position
      1. current position + roll results
   3. % 24 as the board is 5x5 = 25 but the finish square is special and thus I used 24
      1. modulo here helps me to control the circular motion of the game. This was the MVP that made my player move around the perimeter and without it, will move in a row by row manner.
6. Importantly, I also needed to tell the game to know when the player reached the finish square.
   1. An if else statement is created to tell the game if the rollResult causes the play to reach or pass finish
   2. this will trigger the finish event which is created later

### Handling of random events

1. As was shared above, each square has a random event append to it.
2. I need to now trigger the event when the player reaches the square destination based on roll result
3. I created an if else loop with a nested if
   1. This code tells the game that if playerPosition reaches an event space, trigger the handlEvent(event) function which is created later
      1. This is an if else loop mainly for me to test where the hell my player is as when I first started, I never can find the player until i realized that the player’s position went somewhere else…
   2. Once the player has reached to the destined position, the position is now updated via the handlePlayerPosition event

### Making square effects

1. As shared in point 6.i.1, I usually can’t find where the damn player is and I am sure my players won’t either, so I made it a mission to highlight the current position square
2. With that said, highlight sequence, is born

   1. I declared a variable called position and connected it to the startPosition which is where the player currently is
      1. to ensure the highlights do not go out of bounce, I query all the squares and used math.min where total squares - 1 will tell highlight sequence when to stop
   2. within the sequence, I included highlight interval where it will trigger the sequence and highlight the square on the player’s current position aka final position
      1. the else statement here clears the interval this coupled with the math.min above to ensure the highlight will stop when the player reaches or passes Finish
   3. Of course, once highlighted, they need to be cleared, thats when I created the if else loop of highlight interval telling the game when to highlight what based on player position
      1. I needed to clear mainly the border highlight once the player reaches their final position
      2. I also needed to clear the square highlight when the player moves off
   4. I had a lot of issues with this highlight as somehow it seems to determine where my player is rather than the rollResults and thats why there are a bunch of set timeouts to ensure the functions act in a specific time order to not cause the game to get confused.

   ```
   // Handle the player position after highlighting sequence is complete
         setTimeout(() => {
           // Delay to ensure highlighting is complete
           handlePlayerPosition(finalPosition);
         }, 100);
   ```

## Creating the damn di(c)e

- I wanted the dice to.. look like a dice so I generated a dice face. Since I was mad enough to create the board by counting the damn grids manually, what can a 3x3 dice do to me
  - It is important to note that the dice is indeed a 3x3 grid because of the damn “5” face where there is a stupid middle dot.
- Ah, I also wanted the dice roll to have the roll-ish effect so I included a for loop up at rollDie

  ```
  	/ Show random dot positions quickly for 2 seconds
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        die.innerHTML = generateDieFace(Math.floor(Math.random() * 6) + 1);
      }, i * 100); // Change dot position every 100 milliseconds
    }

  ```

## Creating the Restart function

- I tired to make this as simple as possible by just
  - clear all highlights
  - reset the player’s position to 0
    - this caused a problem as the player is now at 0 and highlight will occur so I had to remove the final square highlight
  - reset the face of the dice to show nothing
  - reset the player stats (Stats are given later)

## Creating the getRandomEvent function

- Thinking about what events I wanted led to the simple creation of ENEMY first followed by other events that should make surviving a tad bit more challenging
- To ensure the events are randomly generated i used
  - events[Math.floor(Math.random() * events.length)];
- This helps to go though the list of events and randomly assigns them to the squares
- The effects of each event is handled by… handleEvent

## Handling the events

- Switch Case

  - As i wanted many events, I needed a way to write each event out in without other events affecting it. I also needed the getRandomEvent to be able to call each event independently. Thats how I found out about Switch Case
  - Switch allows me to create as many case (or events) i want and in each case, I can write their individual logic.

  ````
  switch (event) {
    case "Enemy":
    case "HealthPotion":
      if (playerHealth < 100) {
        playerHealth = Math.min(playerHealth + 10, 100); // Heal by 10, capped at 100
        document.getElementById("playerHealth").innerText = playerHealth;
        showModal("Found a health potion! Health restored by 10.");
      } else {
        healthPotions++; // Store the potion if health is full
        document.getElementById("healthPotions").innerText = healthPotions;
        showModal("Found a health potion! Saved for later use.");
      }
      break;
      ```
  - I find this to make my code neat instead of creating individual functions for each event

  ````

- Potions and healing

  - As shared at the buttons section, I wanted players to be able to store their potions if health if 100 so I made a use potion and I needed to make a confirm use potion … - Tedious is the word

    ```
    // Confirm use of potion
    function confirmUsePotion() {
    if (healthPotions > 0) {
    showModalWithYesNo("Use Potion?", usePotion, keepPotion);
    } else {
    showModal("No potions available!");
    }
    }

      // Use a stored health potion
      function usePotion() {
      playerHealth = Math.min(playerHealth + 10, 100);
      healthPotions--;
      document.getElementById("playerHealth").innerText = playerHealth;
      document.getElementById("healthPotions").innerText = healthPotions;
      showModal("Health restored by 10.");
      }

      // Confirm use of potion
      function confirmUsePotion() {
      if (healthPotions > 0) {
      if (playerHealth < 100) {
      showModalWithYesNo("Use Potion?", usePotion, keepPotion);
      } else {
      showModal("You are at full health and cannot use the potion.");
      }
      } else {
      showModal("No potions available!");
      }
      }

      // Keep the potion and close modal
      function keepPotion() {
      showModal("You kept the potion back.");
      }

    ```

## Player stats

- Just some basic let declaration of the player stats
- Needed to use getElementById to ensure the text which were written in HTML gets updated when the player gets hurt or other events
- Needed to also ensure that min health is 0
- Now for some honesty, somehow, I forgot to create a loose event even up to now…

## Modals

- For some events, I needed pop ups for players to interact with such as “next, confirm” etc
- With modals, I managed to create the pop ups to show up during the specific events.
- However, as my thought processes are not in a straight line… I have many different modals for different requirements such as
  - Yes and No
  - Next

```

```
