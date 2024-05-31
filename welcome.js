document.addEventListener("DOMContentLoaded", () => {
  const enterButton = document.getElementById("enterButton");

  enterButton.addEventListener("click", () => {
    // Redirect to the game page or perform any other action
    window.location.href = "game.html";
  });

  let play = true;
  window.onclick = () => {
    if (play) {
      play = !play;
      let audioSource = "Audio/titleAudio.m4a";
      let audioF = new Audio(audioSource);
      audioF.play();
      audioF.onended = () => {
        play = true;
      };
    }
  };
});
