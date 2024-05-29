// script.js

document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("board");
  const colors = ["dirt-brown", "sand"];
  const startSquareIndex = 0; // First square as START section
  const finishSquareIndex = 15; // Finish square

  // Indices of the perimeter squares in a 5x5 grid
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

  // Rows and columns matching the perimeter indices
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

  // Update the square creation loop to include random events
  perimeterIndices.forEach((index, i) => {
    const square = document.createElement("div");
    square.classList.add("square");

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

    // Set the grid position
    const [row, col] = positions[i];
    square.style.gridArea = `${row} / ${col} / span 1 / span 1`;

    // Set random events based on the square
    const event = getRandomEvent();
    square.dataset.event = event;
    console.log("Assigned event:", event, "to square:", i);
    board.appendChild(square);
  });

  //Creating the roll button
  const rollButton = document.getElementById("rollButton");
  rollButton.addEventListener("click", rollDie);

  //Creating restart button
  const restartButton = document.getElementById("restartButton");
  restartButton.addEventListener("click", restartGame);

  // Use Potion button
  const usePotionButton = document.getElementById("usePotionButton");
  usePotionButton.addEventListener("click", confirmUsePotion);
});

// Function to roll the die
let currentPosition = 0; // Keep track of the current position
let currentHighlightedPosition = 0; // Keep track of the currently highlighted position
const finishSquareIndex = 15; // Finish square

function rollDie() {
  const rollResult = Math.floor(Math.random() * 6) + 1; // Generate a random number between 1 and 6
  const die = document.getElementById("die");

  // Declare playerPosition variable
  let playerPosition;

  // Show random dot positions quickly for 2 seconds
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      die.innerHTML = generateDieFace(Math.floor(Math.random() * 6) + 1);
    }, i * 100); // Change dot position every 100 milliseconds
  }

  // After 2 seconds, display the final dot position and handle the event
  setTimeout(() => {
    const newPosition = (currentPosition + rollResult) % 24; // Calculate new position based on roll result
    console.log("new position", newPosition);

    // Clear all previous highlights
    clearHighlight();

    // Start highlighting sequence from the current position
    highlightSequence(currentPosition, newPosition);

    currentPosition = newPosition; // Update current position
    console.log("current Position", currentPosition);
    die.innerHTML = generateDieFace(rollResult); // Display final dot position
    console.log("Player rolled", rollResult);

    setTimeout(() => {
      playerPosition = document.querySelector(".highlight"); // Get the player's current position
      console.log("Player Position:", playerPosition); // Verify the element

      if (playerPosition) {
        console.log("Player Position:", playerPosition);
        if (
          playerPosition.dataset.event &&
          currentPosition !== finishSquareIndex
        ) {
          const event = playerPosition.dataset.event;
          handleEvent(event); // Trigger the event
        }
      } else {
        console.log("Player Position not found!");
      }
      // After checking player's position, handle the position
      handlePlayerPosition(newPosition);
    }, 300);
  }, 2000);
}

function highlightSequence(startPosition, finalPosition) {
  const delay = 300; // Delay between each highlight (in milliseconds)
  let position = startPosition; // Start highlighting from the current position

  // Ensure finalPosition does not exceed the number of squares
  const totalSquares = document.querySelectorAll(".square").length;
  finalPosition = Math.min(finalPosition, totalSquares - 1);

  // Start highlighting sequence
  const highlightInterval = setInterval(() => {
    if (position <= finalPosition) {
      highlightSquare(position, true); // Highlight current position
      console.log("Highlighted square:", position);
      position++;
    } else {
      clearInterval(highlightInterval); // Stop highlighting sequence

      // Clear border highlights from other squares when final position is reached
      clearBorderHighlights(finalPosition);

      if (finalPosition >= finishSquareIndex) {
        highlightSquare(finalPosition, true);
      }
      // Handle the player position after highlighting sequence is complete
      setTimeout(() => {
        // Delay to ensure highlighting is complete
        handlePlayerPosition(finalPosition);

        // Check if the player has reached or passed the FINISH square
        if (finalPosition >= finishSquareIndex) {
          handleFinishEvent(); // Trigger FINISH event
        }
      }, 100);
    }
  }, delay);
}

function clearHighlight() {
  const squares = document.querySelectorAll(".square");
  squares.forEach((square) => {
    square.classList.remove("highlight-border");
    square.classList.remove("highlight");
  });
}

function clearBorderHighlights(finalPosition) {
  const squares = document.querySelectorAll(".square");
  squares.forEach((square, index) => {
    if (index <= finalPosition) {
      square.classList.remove("highlight-border");
    }
  });
}

function highlightSquare(position, highlight) {
  const squares = document.querySelectorAll(".square");
  squares[position].classList.toggle("highlight-border", highlight); // Add or remove border highlight class
  squares[position].classList.toggle(
    "highlight",
    position === currentPosition && highlight
  ); // Fully highlight the final square
}

function generateDieFace(number) {
  const dotPatterns = [
    [], // 0 dots (not used)
    [5], // 1 dot
    [7, 3], // 2 dots
    [1, 5, 9], // 3 dots
    [1, 3, 7, 9], // 4 dots
    [1, 3, 5, 7, 9], // 5 dots
    [1, 3, 4, 6, 7, 9], // 6 dots
  ];

  const dotPositions = dotPatterns[number]; // Get the dot positions for the given number
  let dotHTML = "";

  // Generate HTML for the dots
  for (let i = 1; i <= 9; i++) {
    dotHTML += `<div class="dot ${
      dotPositions.includes(i) ? "filled" : ""
    }"></div>`; // Add dot if included in dotPositions
  }

  return `<div class="die-dot">${dotHTML}</div>`; // Wrap dots in a container
}

//Function for restart button
function restartGame() {
  // Clear all previous highlights
  clearHighlight();

  // Reset the current position to 0 (START)
  currentPosition = 0;
  currentHighlightedPosition = 0; // Also reset the highlighted position

  // Reset the die display
  const die = document.getElementById("die");
  die.innerHTML = generateDieFace(0); // Show initial face of the die

  //Reset player stats
  document.getElementById("playerHealth").innerText = 100;
  document.getElementById("playerDamage").innerText = 10;

  // Remove highlight from the final square
  const squares = document.querySelectorAll(".square");
  squares.forEach((square, index) => {
    square.classList.remove("highlight");
  });
}

// Function to generate random events
function getRandomEvent() {
  const events = [
    "Enemy", // Encounter an enemy
    //"HealthPotion", // Find a health potion
    // "Shop", // Visit a shop
    // "Trap", // Fall into a trap
    "Loot", // Finds Loot (currently just weapon)
    // "DefaultEvent", // Placeholder for a neutral event (optional)
  ];
  return events[Math.floor(Math.random() * events.length)];
}
// Player and stats
let playerHealth = 100;
let playerDamage = 10;
let healthPotions = 0; // Track the number of health potions

document.getElementById("healthPotions").innerText = healthPotions; // Display number of health potions
document.getElementById("playerDamage").innerText = playerDamage;

function updatePlayerHealth(newHealth) {
  const limitedHealth = Math.max(newHealth, 0); // Limit health to minimum of 0
  document.getElementById("playerHealth").innerText = playerHealth;
  console.log("playerHealth", playerHealth);
}

// Function to show the modal dialog with the event text and optional Next button
function showModalWithNext(event, nextButtonCallback) {
  const modalOverlay = document.getElementById("modalOverlay");
  const eventText = document.getElementById("eventText");
  let nextButton = document.getElementById("nextButton");
  const closeModalButton = document.getElementById("closeModalButton");

  eventText.innerText = event; // Update modal content with the event text
  modalOverlay.style.display = "flex"; // Show the modal dialog

  // If a callback function is provided for the Next button, add event listener
  if (nextButtonCallback) {
    nextButton.classList.add("show"); // Add a class to show the button
    nextButton.classList.remove("hide"); // Remove the hide class
    closeModalButton.classList.add("hide"); // Add a class to hide the button
    closeModalButton.classList.remove("show"); // Remove the show class

    // Remove any existing listeners before adding the new one to avoid multiple bindings
    nextButton.replaceWith(nextButton.cloneNode(true));
    nextButton = document.getElementById("nextButton");
    nextButton.addEventListener("click", nextButtonCallback);
  } else {
    nextButton.classList.remove("show"); // Remove class to hide button
    nextButton.classList.add("hide"); // Add the hide class
    closeModalButton.classList.remove("hide"); // Remove the hide class
    closeModalButton.classList.add("show"); // Add the show class
  }
}

// Function to show the modal dialog with Yes and No buttons
function showModalWithYesNo(event, yesCallback, noCallback) {
  const modalOverlay = document.getElementById("modalOverlay");
  const eventText = document.getElementById("eventText");
  const yesButton = document.getElementById("yesButton");
  const noButton = document.getElementById("noButton");
  const closeModalButton = document.getElementById("closeModalButton");

  eventText.innerText = event; // Update modal content with the event text
  modalOverlay.style.display = "flex"; // Show the modal dialog

  // Hide the close button
  closeModalButton.classList.add("hide");
  yesButton.classList.remove("hide");
  noButton.classList.remove("hide");

  // Remove any existing event listeners
  yesButton.removeEventListener("click", yesCallback);
  noButton.removeEventListener("click", noCallback);

  // Add new event listeners
  yesButton.addEventListener("click", () => {
    yesButton.classList.add("hide");
    noButton.classList.add("hide");
    yesCallback();
  });

  noButton.addEventListener("click", () => {
    yesButton.classList.add("hide");
    noButton.classList.add("hide");
    noCallback();
  });
}

// Event handler for random events
function handleEvent(event) {
  switch (event) {
    case "Enemy":
      // Ensure enemy health is within the desired range (5 to 20)
      const enemyStartingHealth = Math.floor(Math.random() * (15 - 5 + 1)) + 5; // Random between 5 and 20 (inclusive)
      const enemy = { health: enemyStartingHealth, damage: 5 };

      // Show encounter message using modal with Next button for combat logic
      showModalWithNext("You have encountered a monster!", handleCombatLogic);

      function handleCombatLogic() {
        // Combat logic
        const playerAttack = playerDamage; // Get player attack value
        const enemyAttack = enemy.damage;

        // Ensure enemy health doesn't go negative before comparison (clamped to minimum of 0)
        enemy.health = Math.max(enemy.health - playerAttack, 0); // Enemy takes damage

        // Check who is stronger and show messages accordingly
        if (playerAttack > enemyStartingHealth) {
          showModal("You are stronger and defeated the monster!");
          // Add reward logic (optional)
        } else {
          // Player takes damage, update health, and display updated value
          playerHealth = Math.max(playerHealth - enemyAttack, 0);
          document.getElementById("playerHealth").innerText = playerHealth; // Update UI directly
          showModal(
            `The monster attacks you! Your health is now ${playerHealth}`
          );
        }
      }
      break;
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
    // case "Shop":
    //   // Show shop interface (optional functionality)
    //   showModal("Welcome to the shop!");
    //   break;
    case "Trap":
      const trapDamage = Math.floor(Math.random() * 5) + 1; // Random trap damage between 1 and 5
      console.log("Trap Damage:", trapDamage);
      console.log("Player Health before Trap:", playerHealth);

      playerHealth = Math.max(playerHealth - trapDamage, 0); // Player takes damage
      document.getElementById("playerHealth").innerText = playerHealth; // Update UI directly
      console.log("Player Health after Trap (UI):", playerHealth);

      showModal(
        `Fell into a trap! Took ${trapDamage} damage. Your health is now ${playerHealth}`
      );
      break;
    case "Loot":
      const damageIncrease = Math.floor(Math.random() * 10) + 1; // Random increase between 1 and 10
      playerDamage += damageIncrease;
      document.getElementById("playerDamage").innerText = playerDamage;
      showModal(
        `You found a weapon! Your damage increased by ${damageIncrease}.`
      );
      break;
    case "DefaultEvent":
      // Handle the default event (optional)
      showModal("Something interesting happened...");
      break;
  }
}

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

// Function to show the modal dialog
function showModal(event) {
  const modalOverlay = document.getElementById("modalOverlay");
  const eventText = document.getElementById("eventText");
  const closeModalButton = document.getElementById("closeModalButton");
  const nextButton = document.getElementById("nextButton");

  eventText.innerText = event; // Update modal content with the event text
  modalOverlay.style.display = "flex"; // Show the modal dialog
  closeModalButton.classList.add("show");
  closeModalButton.classList.remove("hide");
  nextButton.classList.remove("show"); // Hide the Next button
  nextButton.classList.add("hide"); // Ensure the hide class is added
}

// Function to hide the modal dialog
function hideModal() {
  const modalOverlay = document.getElementById("modalOverlay");
  modalOverlay.style.display = "none"; // Hide the modal dialog
}

// Event listener for the close button
const closeModalButton = document.getElementById("closeModalButton");
closeModalButton.addEventListener("click", hideModal);

function handlePlayerPosition(finalPosition) {
  const playerPosition = document.querySelector(".highlight"); // Get the player's current position
  if (playerPosition) {
    console.log("Player Position:", playerPosition); // Verify the element

    if (playerPosition.dataset.event) {
      const event = playerPosition.dataset.event;
      if (event === "FINISH") {
        //Check if the event is FINISH
        handleFinishEvent(); // Trigger FINISH event
      } else {
        handleEvent(event); // Trigger the random event
      }
    }
  } else {
    console.log("Player Position not found!");
  }
}

function handleFinishEvent() {
  showModalWithYesNo(
    "Congratulations! You survived! Continue?",
    continueGame,
    endGame
  );
}

function continueGame() {
  restartGame(); // Reset the game

  // Carry over player stats and items
  document.getElementById("playerHealth").innerText = playerHealth;
  document.getElementById("playerDamage").innerText = playerDamage;
  document.getElementById("healthPotions").innerText = healthPotions;

  // Show a message confirming game continuation
  showModalWithYesNo("Are you sure?", continueGameConfirmed, endGame);
}

// Function to continue the game after confirmation
function continueGameConfirmed() {
  showModal("Game continued! Good luck!");
}

// Function to end the game and show a thank you message
function endGame() {
  restartGame(); // Reset the game
  showModal("Thank you for playing!");
}
