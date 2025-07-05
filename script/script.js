// 🎵 Lista de Músicas
const tracks = [
  {
    title: "Happier",
    artist: "Marshmello",
    src: "assets/music/1.mp3",
    cover: "assets/img/happier.jpg",
    color: "var(--cor-cassete-1)"
  },
  {
    title: "Osama",
    artist: "Dj Nelasta",
    src: "assets/music/2.mp3",
    cover: "assets/img/osama.jpg",
    color: "var(--cor-cassete-2)"
  },
  {
    title: "Want To Want Me",
    artist: "Jason Derulo",
    src: "assets/music/3.mp3",
    cover: "assets/img/want.jpg",
    color: "var(--cor-cassete-3)"
  }
];

// 🎛️ Estado Inicial
let currentTrack = parseInt(localStorage.getItem("currentTrack")) || 0;
let isPlaying = false;
let isLoop = localStorage.getItem("isLoop") === "true";
let isShuffle = localStorage.getItem("isShuffle") === "true";
let shuffledQueue = JSON.parse(localStorage.getItem("shuffledQueue") || "[]");

let rotation = 0;
let lastTimestamp = null;
let rotationFrame = null;

// 🔗 Seleção de Elementos
const audio = document.getElementById("audio-player");
const title = document.getElementById("track-title");
const artist = document.getElementById("track-artist");
const cassette = document.getElementById("cassette");
const playBtn = document.getElementById("play");
const playIcon = document.getElementById("play-icon");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const loopBtn = document.getElementById("loop");
const shuffleBtn = document.getElementById("shuffle");
const trackList = document.getElementById("track-list");
const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".section");

// 🖐️ Minigame Jokenpô
const playerHand = document.getElementById("player-hand");
const cpuHand = document.getElementById("cpu-hand");
const resultText = document.getElementById("result");
const scoreBoard = document.getElementById("scoreboard");
const choiceButtons = document.querySelectorAll(".choices button");

let playerScore = 0;
let cpuScore = 0;

const options = ["pedra", "papel", "tesoura"];
const handIcons = {
  pedra: "https://api.iconify.design/openmoji/raised-fist.svg",
  papel: "https://api.iconify.design/openmoji/raised-hand.svg",
  tesoura: "https://api.iconify.design/openmoji/victory-hand.svg"
};

function playRound(playerChoice) {
  const cpuChoice = options[Math.floor(Math.random() * 3)];

  // 🌀 Animação de mãos
  playerHand.classList.add("animate");
  cpuHand.classList.add("animate");

  // 👋 Ícones temporários (aguarde a animação terminar)
  playerHand.src = handIcons["pedra"];
  cpuHand.src = handIcons["pedra"];

  setTimeout(() => {
    playerHand.classList.remove("animate");
    cpuHand.classList.remove("animate");

    // ⏱️ Atualiza com a jogada real
    playerHand.src = handIcons[playerChoice];
    cpuHand.src = handIcons[cpuChoice];

    // 🧠 Lógica de jogo
    let result;
    if (playerChoice === cpuChoice) {
      result = "Empate!";
    } else if (
      (playerChoice === "pedra" && cpuChoice === "tesoura") ||
      (playerChoice === "papel" && cpuChoice === "pedra") ||
      (playerChoice === "tesoura" && cpuChoice === "papel")
    ) {
      result = "Você venceu!";
      playerScore++;
    } else {
      result = "Você perdeu!";
      cpuScore++;
    }

    resultText.textContent = result;
    scoreBoard.textContent = `Você: ${playerScore} | PC: ${cpuScore}`;
  }, 500);
}

// 🎮 Clique nos botões de escolha
choiceButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const choice = btn.dataset.move;
    playRound(choice);
  });
});

// 🧭 Navegação
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.section;
    sections.forEach(sec => sec.classList.toggle("active", sec.id === target));
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

function loadTrack(index) {
  const track = tracks[index];
  audio.src = track.src;
  title.textContent = track.title;
  artist.textContent = track.artist;
  cassette.style.filter = `drop-shadow(0 0 10px ${track.color})`;
  document.querySelectorAll(".library-item").forEach((item, i) => item.classList.toggle("playing", i === index));
  saveState();
  audio.load();
}

function saveState() {
  localStorage.setItem("currentTrack", currentTrack);
  localStorage.setItem("isLoop", isLoop);
  localStorage.setItem("isShuffle", isShuffle);
  localStorage.setItem("shuffledQueue", JSON.stringify(shuffledQueue));
}

function animateRotation(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  rotation += delta * 0.06;
  cassette.style.transform = `rotate(${rotation}deg)`;
  rotationFrame = requestAnimationFrame(animateRotation);
}

function startRotation() {
  if (!rotationFrame) {
    lastTimestamp = null;
    rotationFrame = requestAnimationFrame(animateRotation);
  }
}

function stopRotation() {
  cancelAnimationFrame(rotationFrame);
  rotationFrame = null;
}

function togglePlay() {
  if (isPlaying) {
    audio.pause();
    playIcon.src = "https://api.iconify.design/mdi/play.svg";
    playIcon.classList.remove("blink");
    stopRotation();
  } else {
    audio.play();
    playIcon.src = "https://api.iconify.design/mdi/pause.svg";
    playIcon.classList.add("blink");
    startRotation();
  }
  isPlaying = !isPlaying;
}

function nextTrack() {
  if (isShuffle) {
    if (shuffledQueue.length === 0) {
      shuffledQueue = shuffleArray(tracks.map((_, i) => i).filter(i => i !== currentTrack));
    }
    currentTrack = shuffledQueue.shift();
  } else {
    currentTrack = (currentTrack + 1) % tracks.length;
  }
  loadTrack(currentTrack);
  if (isPlaying) {
    audio.play();
    startRotation();
  }
}

function prevTrack() {
  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrack);
  if (isPlaying) {
    audio.play();
    startRotation();
  }
}

audio.addEventListener("ended", () => {
  if (isLoop) {
    audio.currentTime = 0;
    audio.play();
  } else {
    nextTrack();
  }
});

audio.addEventListener("timeupdate", () => {
  const current = audio.currentTime;
  const total = audio.duration || 0;
  const percent = (current / total) * 100 || 0;
  progress.value = percent;
  currentTimeEl.textContent = formatTime(current);
  durationEl.textContent = formatTime(total);
  progress.style.background = `linear-gradient(to right, var(--cor-destaque) ${percent}%, #444 ${percent}%)`;
});

progress.addEventListener("input", () => {
  const percent = progress.value;
  audio.currentTime = (percent / 100) * audio.duration;
});

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
}

function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

loopBtn.addEventListener("click", () => {
  isLoop = !isLoop;
  loopBtn.classList.toggle("active", isLoop);
  saveState();
});

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
  shuffledQueue = isShuffle ? shuffleArray(tracks.map((_, i) => i).filter(i => i !== currentTrack)) : [];
  saveState();
});

playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextTrack);
prevBtn.addEventListener("click", prevTrack);

trackList.innerHTML = "";
tracks.forEach((track, index) => {
  const li = document.createElement("li");
  li.className = "library-item";
  li.innerHTML = `
    <img src="${track.cover}" class="cover" alt="Capa" />
    <div class="info">
      <strong>${track.title}</strong><br />
      <span>${track.artist}</span>
    </div>
  `;
  li.addEventListener("click", () => {
    currentTrack = index;
    loadTrack(index);
    audio.play();
    isPlaying = true;
    playIcon.src = "https://api.iconify.design/mdi/pause.svg";
    playIcon.classList.add("blink");
    startRotation();
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById("player-section").classList.add("active");
    navButtons.forEach(b => b.classList.remove("active"));
    document.querySelector('[data-section="player-section"]').classList.add("active");
  });
  trackList.appendChild(li);
});

loadTrack(currentTrack);

window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  setTimeout(() => splash.remove(), 5000);
});