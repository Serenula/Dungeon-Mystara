// script.js
let play = true;
window.onclick = () => {
  if (!play) return;
  play = false;
  const audioSource = new Audio("Audio/BGM.mp3");

  audioSource.play();
  audioSource.volume = 0.05;
  audioSource.onended = () => {
    play = true;
  };
};

let stage = 1;
let gridSize;
let finishSquareIndex;

document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("board");
  const colors = ["dirt-brown"];
  const startSquareIndex = 0; // First square as START section

  window.handleStage = function () {
    if (stage === 1) {
      gridSize = 5;
      finishSquareIndex = 15;
    } else if (stage === 2) {
      gridSize = 6;
      finishSquareIndex = 19;
    } else if (stage === 3) {
      gridSize = 7;
      finishSquareIndex = 23;
    } else if (stage === 4) {
      gridSize = 8;
      finishSquareIndex = 27;
    } else if (stage === 5) {
      gridSize = 9;
      finishSquareIndex = 31;
    } else if (stage === 6) {
      gridSize = 10;
      finishSquareIndex = 35;
    } else if (stage === 7) {
      gridSize = 11;
      finishSquareIndex = 39;
    }
    console.log("Stage:", stage, "Grid Size:", gridSize);
  };

  function generateGrid() {
    board.innerHTML = ""; // Clear existing grid
    const perimeterIndices = [];

    // Calculate perimeter indices for the grid
    for (let i = 0; i < gridSize; i++) {
      perimeterIndices.push(i);
    }
    for (let i = 1; i < gridSize - 1; i++) {
      perimeterIndices.push(gridSize * i + (gridSize - 1));
    }
    for (let i = gridSize - 1; i >= 0; i--) {
      perimeterIndices.push(gridSize * (gridSize - 1) + i);
    }
    for (let i = gridSize - 2; i > 0; i--) {
      perimeterIndices.push(gridSize * i);
    }

    const positions = perimeterIndices.map((index) => {
      let row, col;

      if (index < gridSize) {
        row = 1;
        col = index + 1;
      } else if (index >= gridSize * (gridSize - 1)) {
        row = gridSize;
        col = (index % gridSize) + 1;
      } else {
        col = index % gridSize === 0 ? 1 : gridSize;
        row = Math.floor(index / gridSize) + 1;
      }

      return [row, col];
    });

    perimeterIndices.forEach((index, i) => {
      const square = document.createElement("div");
      square.classList.add("square");

      if (i === startSquareIndex) {
        square.classList.add("gravel-grey");
        square.innerText = "";
      } else if (i === finishSquareIndex) {
        square.classList.add("finishImage");
        square.innerText = "";
        square.dataset.event = "FINISH";
      } else {
        square.classList.add(colors[i % 1]);
        const event = getRandomEvent();
        square.dataset.event = event;
      }

      const [row, col] = positions[i];
      square.style.gridArea = `${row} / ${col} / span 1 / span 1`;

      window.continueGame = function () {
        console.log("continueGame triggered");
        eventModal("Welcome to Stage " + (stage + 1));
        stage++;
        console.log("After increment - Stage:", stage);
        restartGame(); // Reset the game
        handleStage();
        generateGrid(); // Regenerate the grid when the stage changes

        // Carry over player stats and items
        document.getElementById("playerHealth").innerText = playerHealth;
        document.getElementById("playerDamage").innerText = playerDamage;
        document.getElementById("healthPotions").innerText = healthPotions;
        console.log("Stage:", stage, "Grid Size:", gridSize);
      };

      board.appendChild(square);
    });

    board.style.setProperty("--grid-columns", gridSize);
    board.style.setProperty("--grid-rows", gridSize);
  }
  handleStage();
  generateGrid(); // Generate the initial grid

  //Creating the roll button
  const rollButton = document.getElementById("rollButton");
  rollButton.addEventListener("click", rollDie);
  let play = true;

  rollButton.onclick = () => {
    if (!play) return;

    play = false;
    const audio = new Audio("Audio/dice.mp3");

    audio.play();
    audio.volume = 0.2;
    audio.onended = () => {
      play = true;
    };
  };

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

function rollDie() {
  rollButton.removeEventListener("click", rollDie);
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
    const newPosition = (currentPosition + rollResult) % 120; // Calculate new position based on roll result

    // Clear all previous highlights
    clearHighlight();

    // Start highlighting sequence from the current position
    highlightSequence(currentPosition, newPosition);

    currentPosition = newPosition; // Update current position
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

function highlightSequence(startPosition, finalPosition, colors) {
  let walkingAudio = document.getElementById("walking");
  walkingAudio.volume = 1.0; // 1.0 is the maximum volume
  walkingAudio.play();
  const delay = 300; // Delay between each highlight (in milliseconds)
  let position = startPosition; // Start highlighting from the current position

  // Ensure finalPosition does not exceed the number of squares
  const totalSquares = document.querySelectorAll(".square").length;
  finalPosition = Math.min(finalPosition, totalSquares - 1);

  // Start highlighting sequence
  const highlightInterval = setInterval(() => {
    if (position <= finalPosition) {
      highlightSquare(position, true, colors); // Highlight current position
      console.log("Highlighted square:", position);
      position++;
    } else {
      clearInterval(highlightInterval); // Stop highlighting sequence

      // Clear border highlights from other squares when final position is reached
      clearBorderHighlights(finalPosition);

      // Handle the player position after highlighting sequence is complete
      setTimeout(() => {
        // Delay to ensure highlighting is complete
        handlePlayerPosition(finalPosition);
        rollButton.addEventListener("click", rollDie);

        // Check if the player has reached or passed the FINISH square
        if (finalPosition >= finishSquareIndex) {
          handleFinishEvent();
        }
      }, 100); // Adjust the delay as needed
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
  const colors = ["dirt-brown"];
  squares[position].classList.toggle("highlight-border", highlight); // Add or remove border highlight class
  squares[position].classList.toggle(
    "highlight",
    position === currentPosition && highlight
  ); // Fully highlight the final square

  // Toggle the appropriate color classes based on the current position
  if (highlight && position === currentPosition) {
    // Remove the color classes when the highlight is added
    squares[position].classList.remove("dirt-brown");
  } else {
    // Add back the appropriate color class when the highlight is removed
    if (position !== 0) {
      const colors = ["dirt-brown"];
      squares[position].classList.add(colors[position % 1]);
    }
  }
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
  const colors = ["dirt-brown"];
  const event = getRandomEvent();
  squares.forEach((square, position) => {
    square.classList.remove("highlight");
    square.classList.remove(square.dataset.event);
    if (position !== 0 && position !== 39) {
      square.classList.add(colors[position % 1]);
    }
  });
}

// Function to generate random events
function getRandomEvent() {
  const events = [
    "Enemy", // Encounter an enemy
    "HealthPotion", // Find a health potion
    // "Shop", // Visit a shop
    "Trap", // Fall into a trap
    "Loot", // Finds Loot (currently just weapon)
    // "DefaultEvent", // Placeholder for a neutral event (optional)
  ];
  return events[Math.floor(Math.random() * events.length)];
}
// Player and stats
let playerHealth = 100;
let playerDamage = 10;
let healthPotions = 0; // Track the number of health potions
let enemyClass;
let winLoose;
let dead;
let trap;
let potion;
let weapon;

document.getElementById("healthPotions").innerText = healthPotions; // Display number of health potions
document.getElementById("playerDamage").innerText = playerDamage;

function updatePlayerHealth(newHealth) {
  const limitedHealth = Math.max(newHealth, 0); // Limit health to minimum of 0
  document.getElementById("playerHealth").innerText = playerHealth;
  console.log("playerHealth", playerHealth);
}

// Event handler for random events
function handleEvent(event) {
  switch (event) {
    case "Enemy":
      // Ensure enemy health is within the desired range (5 to 15)
      const enemyStartingHealth = Math.floor(Math.random() * (15 - 5 + 1)) + 5; // Random between 5 and 15 (inclusive)
      const enemy = { health: enemyStartingHealth, damage: 5 };
      const playerAttack = playerDamage; // Get player attack value
      const enemyAttack = enemy.damage;

      let enemyClass;
      if (playerAttack > enemyStartingHealth) {
        // If player attack is greater than enemy starting health, display a weak enemy
        enemyClass = "weakEnemy-1";
      } else {
        // Otherwise, display a strong enemy
        enemyClass = "strongEnemy-1";
      }
      console.log("Enemy Type:", enemyClass);

      // Show encounter message using modal with Next button for combat logic
      showModal({
        type: "enemy",
        event: "You have encountered a monster!",
        next: handleCombatLogic,
        enemyClass: enemyClass,
      });

      function handleCombatLogic() {
        // Combat logic

        // Ensure enemy health doesn't go negative before comparison (clamped to minimum of 0)
        enemy.health = Math.max(enemy.health - playerAttack, 0); // Enemy takes damage

        // Check who is stronger and show messages accordingly
        if (playerAttack > enemyStartingHealth) {
          const winLoose = "winImage";
          showModal({
            type: "enemy",
            event: "You defeated the monster successfully!",
            winLoose: winLoose,
          });
          // Add reward logic
        } else {
          // Player takes damage, update health, and display updated value
          playerHealth = Math.max(playerHealth - enemyAttack, 0);
          document.getElementById("playerHealth").innerText = playerHealth; // Updates UI directly
          const winLoose = "looseImage";
          const dead = "deadImage";

          if (playerHealth <= 0) {
            showModal({
              type: "enemy",
              event: "YOU ARE DEAD",
              dead: dead,
            });
          } else {
            showModal({
              type: "enemy",
              event: `The monster attacks you but you managed to escape! Your health is now ${playerHealth}`,
              winLoose: winLoose,
            });
          }
        }
      }
      break;

    case "HealthPotion":
      const potion = "potionImage";
      if (playerHealth < 100) {
        playerHealth = Math.min(playerHealth + 10, 100); // Heal by 10, capped at 100
        document.getElementById("playerHealth").innerText = playerHealth;
        showModal({
          type: "enemy",
          event: "Found a health potion! Health restored by 10.",
          potion: potion,
        });
      } else {
        healthPotions++; // Store the potion if health is full
        document.getElementById("healthPotions").innerText = healthPotions;
        showModal({
          type: "enemy",
          event: "Found a health potion! Saved for later use.",
          potion: potion,
        });
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

      const dead = "deadImage";
      const trap = "trapImage";

      if (playerHealth <= 0) {
        showModal({
          type: "enemy",
          event: "YOU ARE DEAD",
          dead: dead,
        });
      } else {
        showModal({
          type: "enemy",
          event: `Fell into a trap! Took ${trapDamage} damage. Your health is now ${playerHealth}`,
          trap: trap,
        });
      }
      break;

    case "Loot":
      const damageIncrease = Math.floor(Math.random() * 10) + 1; // Random increase between 1 and 10
      const weapon = "weaponImage";
      playerDamage += damageIncrease;
      document.getElementById("playerDamage").innerText = playerDamage;
      showModal({
        type: "enemy",
        event: `You found a weapon! Your damage increased by ${damageIncrease}.`,
        weapon: weapon,
      });
      break;
    case "DefaultEvent":
      // Handle the default event (optional)
      eventModal("Something interesting happened...");
      break;
  }
}
// Use a stored health potion
function usePotion() {
  playerHealth = Math.min(playerHealth + 10, 100);
  healthPotions--;
  document.getElementById("playerHealth").innerText = playerHealth;
  document.getElementById("healthPotions").innerText = healthPotions;
  eventModal("Health restored by 10.");
}
// Confirm use of potion
function confirmUsePotion() {
  const potion = "potionImage";
  if (healthPotions > 0) {
    if (playerHealth < 100) {
      showModal({
        type: "yesNo",
        event: "Use Potion?",
        yes: usePotion,
        no: keepPotion,
        potion: potion,
      });
    } else {
      showModal({
        type: "enemy",
        event: "You are at full health and cannot use the potion.",
        potion: potion,
      });
    }
  } else {
    showModal({
      type: "enemy",
      event: "No potions available!",
      potion: potion,
    });
  }
}

// Keep the potion and close modal
function keepPotion() {
  eventModal("You kept the potion back.");
}
// Function to hide the modal dialog
function hideModal() {
  const modal = document.querySelector(".modal");
  const overlay = document.querySelector(".overlay");
  modal.style.display = "none"; // Hide the modal dialog
  overlay.style.display = "none";
}

// Event listener for the close button
const closeButton = document.getElementById("closeButton");
closeButton.addEventListener("click", hideModal);

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
  const choice = "choiceImage";
  showModal({
    type: "yesNo",
    event: "Congratulations! You survived the floor! Continue?",
    yes: continueGame,
    no: endGame,
    choice: choice,
  });
}
// Function to continue the game after confirmation
function continueGameConfirmed() {
  eventModal("Game continued! Good luck!");
}
// Function to end the game and show a thank you message
function endGame() {
  restartGame(); // Reset the game
  eventModal("Thank you for playing!");
  hideModal();
}
function nextModal(event, next) {
  const overlay = document.querySelector(".overlay");
  const modal = document.querySelector(".modal");
  const eventText = document.getElementById("eventText");
  let nextButton = document.getElementById("nextButton");
  const closeButton = document.getElementById("closeButton");

  eventText.innerText = event;
  overlay.style.display = "flex";
  modal.style.display = "flex";

  if (next) {
    nextButton.classList.add("show");
    nextButton.classList.remove("hide");
    nextButton.addEventListener("click", next);
  } else {
    nextButton.classList.remove("show");
    nextButton.classList.add("hide");
    closeButton.classList.add("show");
    closeButton.classList.remove("hide");
  }
}

function eventModal(event) {
  const overlay = document.querySelector(".overlay");
  const modal = document.querySelector(".modal");
  const eventText = document.getElementById("eventText");
  const closeButton = document.getElementById("closeButton");
  eventText.innerHTML = event;
  overlay.style.display = "flex";
  modal.style.display = "flex";

  closeButton.classList.remove("hide");
  closeButton.classList.add("show");
}
function showModal({
  type,
  event,
  next = null,
  enemyClass = null,
  winLoose = null,
  dead = null,
  trap = null,
  potion = null,
  yes = null,
  no = null,
  choice = null,
  weapon = null,
}) {
  const overlay = document.querySelector(".overlay");
  const modal = document.querySelector(".modal");
  const elements = {
    eventText: document.getElementById("eventText"),
    nextButton: document.getElementById("nextButton"),
    closeButton: document.getElementById("closeButton"),
    enemyImage: document.getElementById("enemyImage"),
    winLooseImage: document.getElementById("winLooseImage"),
    restartButton: document.getElementById("restart"),
    deadImage: document.getElementById("deadImage"),
    trapImage: document.getElementById("trapImage"),
    potionImage: document.getElementById("potionImage"),
    yesButton: document.getElementById("yesButton"),
    noButton: document.getElementById("noButton"),
    choiceImage: document.getElementById("choiceImage"),
    weaponImage: document.getElementById("weaponImage"),
  };

  elements.eventText.innerText = event;
  overlay.style.display = "flex";
  modal.style.display = "flex";

  const images = [
    elements.enemyImage,
    elements.winLooseImage,
    elements.deadImage,
    elements.trapImage,
    elements.potionImage,
    elements.choiceImage,
    elements.weaponImage,
  ];
  images.forEach((img) => (img.style.display = "none"));

  if (type === "enemy") {
    if (enemyClass) {
      elements.enemyImage.className = enemyClass;
      elements.enemyImage.style.display = "block";
      elements.closeButton.classList.add("hide");
    } else if (winLoose) {
      elements.winLooseImage.className = winLoose;
      elements.winLooseImage.style.display = "block";
      elements.nextButton.classList.remove("show");
      elements.closeButton.classList.add("show");
    } else if (dead) {
      elements.deadImage.className = dead;
      elements.deadImage.style.display = "block";
      elements.restartButton.classList.add("show");
      elements.restartButton.addEventListener("click", endGame);
      elements.closeButton.classList.add("hide");
    } else if (trap) {
      elements.trapImage.className = trap;
      elements.trapImage.style.display = "block";
    } else if (potion) {
      elements.potionImage.className = potion;
      elements.potionImage.style.display = "block";
    } else if (weapon) {
      elements.weaponImage.className = weapon;
      elements.weaponImage.style.display = "block";
    }

    if (next) {
      elements.nextButton.classList.add("show");
      elements.nextButton.classList.remove("hide");
      elements.nextButton.addEventListener("click", next);
    } else {
      elements.nextButton.classList.remove("show");
      elements.nextButton.classList.add("hide");
      elements.closeButton.classList.add("show");
      elements.closeButton.classList.remove("hide");
    }
  } else if (type === "yesNo") {
    elements.yesButton.classList.remove("hide");
    elements.noButton.classList.remove("hide");
    elements.closeButton.classList.add("hide");

    function handleYes() {
      elements.yesButton.removeEventListener("click", handleYes);
      elements.noButton.removeEventListener("click", handleNo);
      elements.yesButton.classList.add("hide");
      elements.noButton.classList.add("hide");
      modal.style.display = "none";
      yes();
    }

    function handleNo() {
      elements.yesButton.removeEventListener("click", handleYes);
      elements.noButton.removeEventListener("click", handleNo);
      elements.yesButton.classList.add("hide");
      elements.noButton.classList.add("hide");
      modal.style.display = "none";
      no();
    }

    elements.yesButton.addEventListener("click", handleYes);
    elements.noButton.addEventListener("click", handleNo);

    if (choice) {
      elements.choiceImage.className = choice;
      elements.choiceImage.style.display = "block";
    }
    if (potion) {
      elements.potionImage.className = potion;
      elements.potionImage.style.display = "block";
    }
  }
}
