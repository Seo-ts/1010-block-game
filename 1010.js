const gameBoard = document.querySelector(".game-board");
const blockSlots = document.querySelectorAll(".block-slot");
const scoreDisplay = document.getElementById("score");
const topScoreDisplay = document.getElementById("top-score");
const leaderboardList = document.getElementById("leaderboard-list");

let score = 0;
let topScore = 0;
let leaderboard = [];

// Load leaderboard from localStorage
function loadLeaderboard() {
    const stored = localStorage.getItem("leaderboard");
    leaderboard = stored ? JSON.parse(stored) : [];
    // Ensure topScore reflects the highest score in leaderboard
    topScore = leaderboard.length > 0 ? Math.max(...leaderboard.map(entry => entry.score)) : 0;
    topScoreDisplay.textContent = topScore;
    updateLeaderboardDisplay();
}

// Save leaderboard to localStorage
function saveLeaderboard() {
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

// Update leaderboard display
function updateLeaderboardDisplay() {
    leaderboardList.innerHTML = "";
    leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .forEach((entry, index) => {
            const li = document.createElement("li");
            li.textContent = `${entry.name} - ${entry.score}점`;
            leaderboardList.appendChild(li);
        });
}

// Update score and check for new top score
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = score;
}

const blockBank = [
    { shape: [[1]], color: "#7e8ed5" },
    { shape: [[1, 1]], color: "#fec63c" },
    { shape: [[1], [1]], color: "#fec63c" },
    { shape: [[1, 1, 1]], color: "#ed954a" },
    { shape: [[1], [1], [1]], color: "#ed954a" },
    { shape: [[1, 1, 1, 1]], color: "#e76a81" },
    { shape: [[1], [1], [1], [1]], color: "#e76a81" },
    { shape: [[1, 1, 1, 1, 1]], color: "#dc6555" },
    { shape: [[1], [1], [1], [1], [1]], color: "#dc6555" },
    { shape: [[1, 1], [1, 1]], color: "#98dc55" },
    { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: "#4dd5b0" },
    { shape: [[1, 1], [1, 0]], color: "#59cb86" },
    { shape: [[1, 1], [0, 1]], color: "#59cb86" },
    { shape: [[1, 0], [1, 1]], color: "#59cb86" },
    { shape: [[0, 1], [1, 1]], color: "#59cb86" },
    { shape: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], color: "#5cbee4" },
    { shape: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], color: "#5cbee4" },
    { shape: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], color: "#5cbee4" },
    { shape: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], color: "#5cbee4" }
];

function getRandomBlocks() {
    let chosenBlocks = [];
    while (chosenBlocks.length < 3) {
        let randomIndex = Math.floor(Math.random() * blockBank.length);
        let block = blockBank[randomIndex];
        chosenBlocks.push(block);
    }
    return chosenBlocks;
}

function placeBlocks() {
    const blocks = getRandomBlocks();
    blockSlots.forEach((slot, index) => {
        slot.innerHTML = "";
        const { shape, color } = blocks[index];
        const blockElement = document.createElement("div");
        blockElement.classList.add("block");
        blockElement.style.display = "grid";
        blockElement.style.gridTemplateColumns = `repeat(${shape[0].length}, 40px)`;
        blockElement.style.gridTemplateRows = `repeat(${shape.length}, 40px)`;
        blockElement.setAttribute("draggable", "true");

        blockElement.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("blockData", JSON.stringify(shape));
            e.dataTransfer.setData("blockColor", color);
            e.dataTransfer.setData("slot-id", slot.id);
        });

        shape.forEach(row => {
            row.forEach(cellValue => {
                const cellDiv = document.createElement("div");
                cellDiv.style.width = "40px";
                cellDiv.style.height = "40px";
                if (cellValue === 1) {
                    cellDiv.style.backgroundColor = color;
                    cellDiv.style.border = "2px solid white";
                    cellDiv.style.borderRadius = "5px";
                } else {
                    cellDiv.style.backgroundColor = "transparent";
                }
                blockElement.appendChild(cellDiv);
            });
        });

        slot.appendChild(blockElement);
    });
}

function checkAndGenerateNewBlocks() {
    const remainingBlocks = document.querySelectorAll(".block-slot .block");
    if (remainingBlocks.length === 0) {
        placeBlocks();
    }
}

function checkAndClearLines() {
    let clearedCellsSet = new Set();
    for (let r = 0; r < 10; r++) {
        let isRowFull = true;
        let rowCells = [];
        for (let c = 0; c < 10; c++) {
            let index = r * 10 + c;
            if (!gameBoard.children[index].classList.contains("filled")) {
                isRowFull = false;
                break;
            }
            rowCells.push(index);
        }
        if (isRowFull) {
            rowCells.forEach(index => clearedCellsSet.add(index));
        }
    }

    for (let c = 0; c < 10; c++) {
        let isColFull = true;
        let colCells = [];
        for (let r = 0; r < 10; r++) {
            let index = r * 10 + c;
            if (!gameBoard.children[index].classList.contains("filled")) {
                isColFull = false;
                break;
            }
            colCells.push(index);
        }
        if (isColFull) {
            colCells.forEach(index => clearedCellsSet.add(index));
        }
    }

    if (clearedCellsSet.size > 0) {
        let delay = 0;
        let cellsArray = Array.from(clearedCellsSet);
        cellsArray.forEach((index, i) => {
            setTimeout(() => {
                let cell = gameBoard.children[index];
                cell.style.backgroundColor = "white";
                cell.classList.remove("filled");
            }, delay + i * 50);
        });

        setTimeout(() => {
            updateScore(clearedCellsSet.size);
        }, delay + cellsArray.length * 50);
    }
}

gameBoard.addEventListener("dragover", (e) => {
    e.preventDefault();
});

gameBoard.addEventListener("drop", (e) => {
    e.preventDefault();
    const blockDataString = e.dataTransfer.getData("blockData");
    const blockColor = e.dataTransfer.getData("blockColor");
    if (!blockDataString) return;

    const blockData = JSON.parse(blockDataString);
    const sourceSlotId = e.dataTransfer.getData("slot-id");
    const cell = e.target.closest(".cell");
    if (!cell) return;

    const cellIndex = Array.from(gameBoard.children).indexOf(cell);
    const row = Math.floor(cellIndex / 10);
    const col = cellIndex % 10;

    let canPlace = true;
    blockData.forEach((blockRow, r) => {
        blockRow.forEach((cellValue, c) => {
            if (cellValue === 1) {
                const targetIndex = (row + r) * 10 + (col + c);
                if (row + r >= 10 || col + c >= 10 || gameBoard.children[targetIndex].classList.contains("filled")) {
                    canPlace = false;
                }
            }
        });
    });

    if (!canPlace) return;

    blockData.forEach((blockRow, r) => {
        blockRow.forEach((cellValue, c) => {
            if (cellValue === 1) {
                const targetIndex = (row + r) * 10 + (col + c);
                gameBoard.children[targetIndex].style.backgroundColor = blockColor;
                gameBoard.children[targetIndex].classList.add("filled");
            }
        });
    });

    const blockSize = blockData.flat().filter(v => v === 1).length;
    updateScore(blockSize);

    const sourceSlot = document.getElementById(sourceSlotId);
    if (sourceSlot) {
        sourceSlot.innerHTML = "";
    }

    checkAndClearLines();
    checkAndGenerateNewBlocks();
});

function resetGame() {
    score = 0;
    scoreDisplay.textContent = score;
    gameBoard.innerHTML = "";
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        gameBoard.appendChild(cell);
    }
    blockSlots.forEach(slot => {
        slot.innerHTML = "";
    });
    placeBlocks();
}

function endGame() {
    if (score > topScore) {
        topScore = score;
        topScoreDisplay.textContent = topScore;
        const playerName = prompt("New high score! Enter your name:");
        const name = playerName && playerName.trim() !== "" ? playerName.trim() : "Anonymous";
        leaderboard.push({ name, score });
        saveLeaderboard();
        updateLeaderboardDisplay();
    } else if (score > 0) {
        // Allow adding to leaderboard if score is positive, even if not a top score
        const playerName = prompt("Game over! Enter your name for the leaderboard:");
        const name = playerName && playerName.trim() !== "" ? playerName.trim() : "Anonymous";
        leaderboard.push({ name, score });
        saveLeaderboard();
        updateLeaderboardDisplay();
    }
    resetGame();
}

const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", resetGame);

const endGameButton = document.getElementById("endgame-button");
endGameButton.addEventListener("click", endGame);

// Initialize game
loadLeaderboard();
for (let i = 0; i < 100; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    gameBoard.appendChild(cell);
}
placeBlocks();
