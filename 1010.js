
    const gameBoard = document.querySelector(".game-board");
    const blockSlots = document.querySelectorAll(".block-slot");
    const scoreDisplay = document.getElementById("score");

    let score = 0;

//-----------------------------------------------------
// 1️⃣ Local Storage에서 topScore 가져오기
let topScore = localStorage.getItem("topScore");

// 2️⃣ 가져온 값이 없으면 0으로 설정
if (topScore === null) {
    topScore = 0;
} else {
    topScore = parseInt(topScore); // 문자열을 숫자로 변환
}

// 3️⃣ top-score 업데이트
document.getElementById("top-score").textContent = topScore;
//-----------------------------------------------------------


    function updateScore(points) {
        score += points;
        scoreDisplay.textContent = score;
    }

    // 10x10 게임 보드 생성
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        gameBoard.appendChild(cell);
    }

const blockBank = [
    { shape: [[1]], color: "#7e8ed5" }, // 1x1 블록
    { shape: [[1, 1]], color: "#fec63c" }, // 1x2 블록
    { shape: [[1], [1]], color: "#fec63c" }, // 2x1 블록
    { shape: [[1, 1, 1]], color: "#ed954a" }, // 1x3 블록
    { shape: [[1], [1], [1]], color: "#ed954a" }, // 3x1 블록
    { shape: [[1, 1, 1, 1]], color: "#e76a81" }, // 1x4 블록
    { shape: [[1], [1], [1], [1]], color: "#e76a81" }, // 4x1 블록
    { shape: [[1, 1, 1, 1, 1]], color: "#dc6555" }, // 1x5 블록
    { shape: [[1], [1], [1], [1], [1]], color: "#dc6555" }, // 5x1 블록
    { shape: [[1, 1], [1, 1]], color: "#98dc55" }, // 2x2 블록
    { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: "#4dd5b0" }, // 3x3 블록

    // 2x2에서 한쪽 꼭짓점 제거 (4종류)
    { shape: [[1, 1], [1, 0]], color: "#59cb86" },
    { shape: [[1, 1], [0, 1]], color: "#59cb86" },
    { shape: [[1, 0], [1, 1]], color: "#59cb86" },
    { shape: [[0, 1], [1, 1]], color: "#59cb86" },

    // 3x3에서 한쪽 꼭짓점 2x2 제거 (4종류)
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

// 블록 생성 함수 (색상 적용)
function placeBlocks() {
    const blocks = getRandomBlocks();

    blockSlots.forEach((slot, index) => {
        slot.innerHTML = "";
        const { shape, color } = blocks[index]; // 블록 모양과 색상 가져오기

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
                    cellDiv.style.backgroundColor = "transparent"; // 빈칸은 투명하게
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
    let clearedCellsSet = new Set(); // 중복 제거를 위한 Set

    // 1️⃣ 가로 줄 체크 (왼쪽 → 오른쪽 순서로 삭제)
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

    // 2️⃣ 세로 줄 체크 (위 → 아래 순서로 삭제)
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
            colCells.forEach(index => clearedCellsSet.add(index)); // 중복된 셀 자동 제거
        }
    }

    // 3️⃣ 순차적으로 셀 삭제 애니메이션 적용
    if (clearedCellsSet.size > 0) {
        let delay = 0;
        let cellsArray = Array.from(clearedCellsSet); // Set을 배열로 변환

        cellsArray.forEach((index, i) => {
            setTimeout(() => {
                let cell = gameBoard.children[index];
                cell.style.backgroundColor = "white";
                cell.classList.remove("filled");
            }, delay + i * 50);
        });

        // 애니메이션 후 점수 추가
        setTimeout(() => {
            updateScore(clearedCellsSet.size); // 중복 없이 정확한 개수만 점수 추가
        }, delay + cellsArray.length * 50);
    }
}

    gameBoard.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

// 블록을 배치할 때 색상 적용
gameBoard.addEventListener("drop", (e) => {
    e.preventDefault();

    const blockDataString = e.dataTransfer.getData("blockData");
    const blockColor = e.dataTransfer.getData("blockColor"); // 색상 정보 가져오기
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
                gameBoard.children[targetIndex].style.backgroundColor = blockColor; // 색상 적용
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

      // 리셋 버튼 클릭 시 게임 초기화
    function resetGame() {
        // 점수 초기화
        score = 0;
        scoreDisplay.textContent = score;

        // 게임 보드 초기화
        gameBoard.innerHTML = "";
        for (let i = 0; i < 100; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            gameBoard.appendChild(cell);
        }

        // 블록 슬롯 초기화
        blockSlots.forEach(slot => {
            slot.innerHTML = "";
        });

        // 새로운 블록 배치
        placeBlocks();
    }

    // 리셋 버튼에 클릭 이벤트 추가
    const resetButton = document.getElementById("reset-button");
    resetButton.addEventListener("click", resetGame);

const topScoreDisplay = document.getElementById("top-score");

function endGame() {
    if (score > topScore) {
        topScore = score;
        document.getElementById("top-score").textContent = topScore;

        localStorage.setItem("topScore", topScore);
    }

    resetGame();
}


    // endgame에 이벤트 추가
    const endGameButton = document.getElementById("endgame-button");
    endGameButton.addEventListener('click', endGame);

    placeBlocks();
