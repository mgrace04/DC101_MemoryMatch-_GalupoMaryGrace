const board = document.getElementById('game_board');
const startingPage = document.getElementById('starting-page');
const statsContainer = document.getElementById('stats_container');
const movesCounter = document.getElementById('moves_counter');
const timerDisplay = document.getElementById('timer');
const resetButton = document.getElementById('reset_btn');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const modalStats = document.getElementById('modal-stats');
const modalCloseButton = document.getElementById('modal-close-button');
const flipSound = new Audio('sounds/flip.mp3');
const matchSound = new Audio('sounds/match.mp3');
const winSound = new Audio('sounds/win.mp3');

flipSound.volume = 0.5;

// Difficulty Buttons
const easyBtn = document.getElementById('easy_btn');
const mediumBtn = document.getElementById('medium_btn');
const hardBtn = document.getElementById('hard_btn');

const initialSetup = startingPage; 

// Game State Variables
let hasFlippedCard = false;
let lockBoard = false;
let firstCard = null;
let secondCard = null;
let matches = 0;
let moves = 0;
let startTime = 0;
let timerInterval = null;
let currentDifficulty = ''; 
let currentCardSet = []; 

// Array of image filenames
const allImages = [
  'strawberry.png', 'cherry.png', 'watermelon.png', 'ribbon.png', 
  'bread.png', 'coffee.png', 'ice cream.png', 'donut.png', 
  'pizza.png', 'taco.png', 'burger.png', 'fries.png', 
  'cookie.png', 'pudding.png', 'pancake.png'
];

// Difficulty definitions
const difficulties = {
  easy: { pairs: 6, boardClass: 'easy' },   // 12 cards
  medium: { pairs: 8, boardClass: 'medium' }, // 16 cards
  hard: { pairs: 15, boardClass: 'hard' }   // 30 cards
};

/**
 * Shuffles an array of items
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Initializes the game board
 */
function createBoard() {
  const config = difficulties[currentDifficulty];
  const pairsNeeded = config.pairs;

  const selectedImages = allImages.slice(0, pairsNeeded);
  currentCardSet = selectedImages; 
  
  const cards = [...currentCardSet, ...currentCardSet];
  const shuffledCards = shuffleArray(cards);

  board.innerHTML = '';
  board.classList.remove('easy', 'medium', 'hard'); 
  board.classList.add(config.boardClass); 
  
  shuffledCards.forEach((imageFilename) => { 
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = imageFilename; 

    card.innerHTML = `
     <div class="card-face front"><img src="images/${imageFilename}" alt="${imageFilename.split('.')[0]}"></div>
     <div class="card-face back">?</div>
    `;
    
    card.addEventListener('click', flipCard);
    board.appendChild(card);
  });
}

/**
 * Handles the card flip action.
 */
function flipCard() {
  if (lockBoard || this === firstCard) return;

  flipSound.currentTime = 0; 
  flipSound.play().catch(() => {});

  this.classList.add('flip');

  if (moves === 0 && !timerInterval) {
    startTimer();
  }

  this.classList.add('flip');

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  secondCard = this;
  moves++;
  updateStats();

  checkForMatch();
}

/**
 * Checks if the two flipped cards are a match.
 */
function checkForMatch() {
  const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
  
  isMatch ? disableCards() : unflipCards();
}

/**
 * Handles a successful match.
 */
function disableCards() {
  setTimeout(() => {
    matchSound.currentTime = 0;
    matchSound.play();
  }, 200);

  firstCard.classList.add('match');
  secondCard.classList.add('match');
  
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  
  matches++;
  resetBoardState();
  
  // Check for win condition
  if (matches === currentCardSet.length) {
    stopTimer();
    setTimeout(showWinModal, 500); 
  }
}

/**
 * Handles a failed match (unflip).
 */
function unflipCards() {
  lockBoard = true; 

  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    resetBoardState();
  }, 1000); 
}

/**
 * Resets the transient state variables.
 */
function resetBoardState() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = `Time: ${elapsedTime}s`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}


function updateStats() {
  movesCounter.textContent = `Moves: ${moves}`;
}

function showWinModal() {
  winSound.play();
  const finalTime = Math.floor((Date.now() - startTime) / 1000);
  
  modalMessage.textContent = "🥳 You Win!";
  modalStats.innerHTML = `
    Difficulty: ${currentDifficulty.toUpperCase()}<br>
    Pairs: ${currentCardSet.length}<br>
    Moves: <b>${moves}</b> / Time: <b>${finalTime}s</b>
  `;
  modal.classList.remove('hidden');
}


/**
 * Core function to start or reset the game based on difficulty choice.
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 */
function startGame(difficulty) {
  stopTimer();
  currentDifficulty = difficulty;

  initialSetup.classList.add('hidden');
  statsContainer.classList.remove('hidden');
  board.classList.remove('hidden');

  hasFlippedCard = false;
  firstCard = null;
  secondCard = null;
  matches = 0;
  moves = 0;
  
  lockBoard = true; 

  updateStats();
  timerDisplay.textContent = 'Time: 0s';
  
  createBoard();

  const revealTimes = { easy: 2000, medium: 1500, hard: 800 };

revealCardsTemporarily(revealTimes[currentDifficulty]);
}

function revealCardsTemporarily(duration) {
  const allCards = document.querySelectorAll('.card');

  flipSound.play().catch(() => {}); 

  allCards.forEach(card => card.classList.add('flip'));

  setTimeout(() => {
    allCards.forEach(card => card.classList.remove('flip'));
    lockBoard = false;
  }, duration);
}

function handleDifficultySelection(event) {
  const difficulty = event.target.id.split('_')[0]; 
  if (difficulty) {
    startGame(difficulty);
  }
}

function initializeGame() {
  easyBtn.addEventListener('click', handleDifficultySelection);
  mediumBtn.addEventListener('click', handleDifficultySelection);
  hardBtn.addEventListener('click', handleDifficultySelection);
  
  resetButton.addEventListener('click', () => {
    if (currentDifficulty) {
      startGame(currentDifficulty);
    } else {
      statsContainer.classList.add('hidden');
      initialSetup.classList.remove('hidden');
    }
  });

  modalCloseButton.addEventListener('click', () => {
    modal.classList.add('hidden');
    initialSetup.classList.remove('hidden');
    statsContainer.classList.add('hidden');
    
    board.innerHTML = '';
    board.classList.remove('easy', 'medium', 'hard');
  });
}

// -------------------- Initialization --------------------
window.addEventListener('DOMContentLoaded', initializeGame);