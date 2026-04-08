
document.addEventListener("DOMContentLoaded", () => {

    const gameEl = document.getElementById("word-game");
    const messageEl = document.getElementById("wg-message");

     if (!gameEl) return; // No game element found, exit early

    const cols = parseInt(gameEl.dataset.length);
    const rows = parseInt(gameEl.dataset.rows);

    let grid = [];
    let currentRow = 0;
    let currentCol = 0;
    let gameOver = false;
    let guessedWords = [];

    init();

    async function init() {
        await fetchWord();
        createGrid();
        updateActiveCell();
    }

    async function fetchWord() {

        const res = await fetch(wgData.ajaxUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=wg_get_word&length=${cols}`
        });

        const data = await res.json();
    }


    function createGrid() {
        gameEl.innerHTML = "";
        grid = [];

        for (let r = 0; r < rows; r++) {

            let row = document.createElement("div");
            row.className = "row";

            let rowCells = [];

            for (let c = 0; c < cols; c++) {
                let cell = document.createElement("div");
                cell.className = "cell";
                row.appendChild(cell);
                rowCells.push(cell);
            }

            gameEl.appendChild(row);
            grid.push(rowCells);
        }
    }

    function updateActiveCell() {

        document.querySelectorAll(".cell").forEach(cell => {
            cell.classList.remove("active");
        });

        let col = currentCol === cols ? cols - 1 : currentCol;

        if (grid[currentRow] && grid[currentRow][col]) {
            grid[currentRow][col].classList.add("active");
        }
    }

    function showMessage(text, type = "") {
        messageEl.textContent = text;
        messageEl.className = type ? "wg-" + type : "";

        setTimeout(() => {
            messageEl.textContent = "";
            messageEl.className = "";
        }, 10000);
    }

    document.addEventListener("keydown", async (e) => {

        if (gameOver) return;

        if (e.key === "Backspace") {
            if (currentCol > 0) {
                currentCol--;
                grid[currentRow][currentCol].textContent = "";
                updateActiveCell();
            }
        }

        else if (e.key === "Enter") {
            if (currentCol === cols) {
                await checkWord();
            } else {
                showMessage("Type " + cols + " letters!", "error");
            }
        }

        else if (/^[a-zA-Z]$/.test(e.key)) {
            if (currentCol < cols) {
                grid[currentRow][currentCol].textContent = e.key.toUpperCase();
                currentCol++;
                updateActiveCell();
            }
        }
    });

    async function checkWord() {

        const guess = grid[currentRow]
            .map(cell => cell.textContent.toLowerCase())
            .join("");

        // Check if already used
        if (guessedWords.includes(guess)) {
            console.log("❌ Word already used: '" + guess + "'");
            showMessage("Already used this word!", "error");
            return;
        }

        guessedWords.push(guess);

        const res = await fetch(wgData.ajaxUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=check_word&guess=${guess}`
        });

        const data = await res.json();

        // Check if word is valid on server side
        if (data.valid === false) {
            guessedWords.pop(); // Remove from guessed words
            showMessage(data.message || "Invalid word!", "error");
            return;
        }

        const result = data.result;

        const resultArray = Array.isArray(result) ? result : Object.values(result);

        resultArray.forEach((item, i) => {

            if (!item || !item.exists) {
                grid[currentRow][i].classList.add("grey");
            }
            else if (!item.position) {
                grid[currentRow][i].classList.add("yellow");
            }
            else {
                grid[currentRow][i].classList.add("green");
            }
        });

        if (resultArray.every(x => x.position)) {
            showMessage("🎉 You Win! Word: " + data.word, "success");
            gameOver = true;
            return;
        }

        if (currentRow === rows - 1) {
            // Fetch correct word safely
            const res2 = await fetch(wgData.ajaxUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: "action=wg_reveal_word"
            });

            const reveal = await res2.json();

            showMessage("Game Over! Word: " + reveal.word, "error");
            gameOver = true;
            return;
        }

        currentRow++;
        currentCol = 0;
        updateActiveCell();
    }

    document.getElementById("wg-restart").addEventListener("click", () => {
        location.reload();
    });

});
