let words = [];
let correctWord = "";

let grid = [];
let currentRow = 0;
let currentCol = 0;

let guessedWords = [];
let gameOver = false;

const gameEl = document.getElementById("word-game");

function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)];
}

function resetState() {
    currentRow = 0;
    currentCol = 0;
    guessedWords = [];
    gameOver = false;
}

function disableGame() {
    gameEl.classList.add("disabled");
}

function enableGame() {
    gameEl.classList.remove("disabled");
}

/* ================= LOAD ================= */

fetch(wgData.pluginUrl + "words.json")
    .then(res => res.json())
    .then(data => {
        words = data;
        initGame();
    });

/* ================= INIT ================= */

function initGame() {
    resetState();
    enableGame();

    correctWord = getRandomWord();
    console.log("Answer:", correctWord);

    createGrid();
    updateActiveCell();
}

/* ================= GRID ================= */

function createGrid() {
    gameEl.innerHTML = "";
    grid = [];

    for (let r = 0; r < 5; r++) {
        let row = document.createElement("div");
        row.className = "row";

        let rowCells = [];

        for (let c = 0; c < 5; c++) {
            let cell = document.createElement("div");
            cell.className = "cell";
            row.appendChild(cell);
            rowCells.push(cell);
        }

        gameEl.appendChild(row);
        grid.push(rowCells);
    }
}

/* ================= ACTIVE ================= */

function updateActiveCell() {
    document.querySelectorAll(".cell").forEach(cell =>
        cell.classList.remove("active")
    );

    let col = currentCol === 5 ? 4 : currentCol;

    grid[currentRow]?.[col]?.classList.add("active");
}

/* ================= UI ================= */

function showMessage(text, type = "") {
    const msg = document.getElementById("wg-message");

    msg.textContent = text;
    msg.className = "";

    if (type) msg.classList.add(`wg-${type}`);

    setTimeout(() => {
        msg.textContent = "";
        msg.className = "";
    }, 2000);
}

function shakeRow() {
    const rowEl = document.querySelectorAll(".row")[currentRow];
    rowEl.classList.add("shake");

    setTimeout(() => rowEl.classList.remove("shake"), 300);
}

/* ================= INPUT ================= */

document.addEventListener("keydown", (e) => {

    if (e.key === "Enter" && document.activeElement.id === "wg-restart") {
        e.preventDefault();
        return;
    }

    if (gameOver || !correctWord || currentRow >= 6) return;

    if (e.key === "Backspace") {
        if (currentCol > 0) {
            currentCol--;
            grid[currentRow][currentCol].textContent = "";
            updateActiveCell();
        }
    }

    else if (e.key === "Enter") {
        if (currentCol === 5) checkWord();
    }

    else if (/^[a-zA-Z]$/.test(e.key)) {
        if (currentCol < 5) {
            grid[currentRow][currentCol].textContent = e.key.toUpperCase();
            currentCol++;
            updateActiveCell();
        }
    }
});

/* ================= VALIDATION ================= */

function isValidWord(word) {
    return words.includes(word);
}

/* ================= GAME LOGIC ================= */

function checkWord() {

    const guess = grid[currentRow]
        .map(cell => cell.textContent.toLowerCase())
        .join("");

    if (!isValidWord(guess)) {
        showMessage("Not a valid word", "error");
        shakeRow();
        return;
    }

    if (guessedWords.includes(guess)) {
        showMessage("Already used", "error");
        shakeRow();
        return;
    }

    guessedWords.push(guess);

    let correctArr = correctWord.split("");
    let guessArr = guess.split("");
    let result = ["", "", "", "", ""];

    // GREEN
    for (let i = 0; i < 5; i++) {
        if (guessArr[i] === correctArr[i]) {
            result[i] = "green";
            correctArr[i] = null;
            guessArr[i] = null;
        }
    }

    // YELLOW / GREY
    for (let i = 0; i < 5; i++) {
        if (guessArr[i] && correctArr.includes(guessArr[i])) {
            result[i] = "yellow";
            correctArr[correctArr.indexOf(guessArr[i])] = null;
        } else if (guessArr[i]) {
            result[i] = "grey";
        }
    }

    grid[currentRow].forEach((cell, i) => {
        cell.classList.add(result[i]);
    });

    if (guess === correctWord) {
        showMessage("🎉 You Win!", "success");
        gameOver = true;
        disableGame();
        return;
    }

    if (currentRow === 5) {
        showMessage("Game Over! Word: " + correctWord, "error");
        gameOver = true;
        disableGame();
        return;
    }

    currentRow++;
    currentCol = 0;
    updateActiveCell();
}

/* ================= RESTART ================= */

document.addEventListener("click", (e) => {
    if (e.target?.id === "wg-restart") {
        e.target.blur();
        initGame(); // ✅ DRY reuse
        document.body.focus();
    }
});
