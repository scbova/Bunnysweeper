const bunny = '<img class="bunny-icon" src="bunny.png" alt="Bunny Icon" style="width: 45px; height: 45px;" />';
const carrot = '<img class="carrot-icon" src="carrot.png" alt="Carrot Icon" style="width: 45px; height: 45px;" />';
const replay = document.createElement("button");
var firstClick = true;
var gameOver = false;
var carrotCount = 10;
var openedCells = 0;
var board = Array.from({ length: 9 }, () => 
    Array.from({ length: 9 }, () => ({
        isBunny: false,   
        state: "unopened",    // "unopened" | "opened" | "flagged"
        adjacentBunnies: undefined
    }))
);

/**
 * Set up game when window opens the link
 */
window.onload = function() {
    setGame();
}

/**
 * Set board with cells
 */
function setGame() {
    const numCarrots = document.getElementById('numCarrots');
    numCarrots.textContent = carrotCount.toString(); 

    const boardElement = document.getElementById('board');

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            let cell = document.createElement('div');
            cell.id = row.toString() + "-" + col.toString();

            cell.addEventListener("contextmenu", function(event) {
                event.preventDefault(); // Prevent browser default pop-ups
            });

            cell.addEventListener("click", () => revealCell(cell));

            cell.addEventListener("pointerdown", function(event) {
                //Two-finger click places carrot
                if (event.buttons === 2) {
                    placeCarrot(cell); 
                }
            });

            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;

            if ((row + col) % 2 === 0) {
                cell.style.backgroundColor = '#a4c1ac'; // Light color
            } else {
                cell.style.backgroundColor = '#9bb5a2'; // Dark color
            }

            boardElement.appendChild(cell);
        }
    } 
}

/**
 * Places the bunnies on the board, can't be placed on the first opened cell.
 * @param {number} clickRow - The row of the user's first clicked cell
 * @param {number} clickCol - The column of the user's first clicked cell
 */
function placeBunnies(clickRow, clickCol) {
    var placedBunnies = 0;

    while (placedBunnies < 10) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);

        if (!board[row][col].isBunny && (row != clickRow || col != clickCol)) {
            board[row][col].isBunny = true;
            placedBunnies++;
        }
    }
}

/**
 * Sets the number of adjacent bunnies for each cell.
 */
function setAdjacentBunnies() {
    var numAdjBunnies = 0;

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            let bunnyCount = 0;

            if (board[row][col].state === "flagged") {
                board[row][col].state = "unopened";
                const cell = document.getElementById(row.toString() + "-" + col.toString());
                cell.innerHTML = '';
            }

            if (!board[row][col].isBunny) {
                for (let rowOff = -1; rowOff <= 1; rowOff++) {
                    for (let colOff = -1; colOff <= 1; colOff++) {
                        let rowCheck = row + rowOff;
                        let colCheck = col + colOff;

                        if (
                            rowCheck >= 0 && rowCheck < 9 &&
                            colCheck >= 0 && colCheck < 9 &&
                            !(colOff === 0 && rowOff === 0) && 
                            board[rowCheck][colCheck].isBunny
                        ) {
                            bunnyCount++;
                        }
                    }
                }

                board[row][col].adjacentBunnies = bunnyCount;
            }
        }
    }
}

/**
 * Places a carrot on a cell when a user two-finger clicks on a cell.
 * @param {cell} cell - The cell the user two-finger clicked on
 */
function placeCarrot(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    //If the game is over or the cell is already opened, don't do anything
    if (gameOver || board[row][col].state === "opened") {
        return;
    }

    //If cell was already flagged, remove the carrot
    if (board[row][col].state === "flagged") {
        board[row][col].state = "unopened";
        carrotCount++;
        cell.innerHTML = '';
        numCarrots.textContent = carrotCount.toString(); 
        return;
    }

    board[row][col].state = "flagged";
    cell.innerHTML = carrot;
    carrotCount--;
    numCarrots.textContent = carrotCount.toString(); 
}

/**
 * Reveal cell when user clicks on it
 */
function revealCell(cell) {
    if (gameOver) {
        return;
    }

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (firstClick) {
        placeBunnies(row, col);
        firstClick = false;
        setAdjacentBunnies(); 
        carrotCount = 10;
        numCarrots.textContent = carrotCount.toString(); 
    }

    if (board[row][col].isBunny) {
        cell.innerHTML = bunny;
        endGame();
        return;
    } else {
        if (board[row][col].state === "flagged") {
            carrotCount++;
            cell.innerHTML = '';
            numCarrots.textContent = carrotCount.toString(); 
            board[row][col].state = "unopened";
        }

        if (board[row][col].state === "unopened") {
            if ((row + col) % 2 === 0) {
                cell.style.backgroundColor = '#c0b0d2'; // Light color
            } else {
                cell.style.backgroundColor = '#b1a3c1'; // Dark color
            }

            cell.textContent = board[row][col].adjacentBunnies || ''; 
            board[row][col].state = "opened";
            openedCells++;

            if (board[row][col].adjacentBunnies === 0) {
                revealChunk(cell);
            }
        }
    }

    if (openedCells === 71) {
        winGame();
    }
}

/**
 * When a user clicks on a cell with 0 adjacent bunnies, reveal all adjacent cells
 * @param {cell} cell - the cell with 0 adjacent bunnies that the user clicked on
 */
function revealChunk(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    for (let rowOff = -1; rowOff <= 1; rowOff++) {
        for (let colOff = -1; colOff <= 1; colOff++) {
            let rowCheck = row + rowOff;
            let colCheck = col + colOff;

            if (
                rowCheck >= 0 && rowCheck < 9 &&
                colCheck >= 0 && colCheck < 9 &&
                !(colOff === 0 && rowOff === 0)
            ) {
                const adjCell = document.getElementById(rowCheck.toString() + "-" + colCheck.toString());

                if (board[rowCheck][colCheck].state === "flagged") {
                    carrotCount++;
                    adjCell.innerHTML = '';
                    numCarrots.textContent = carrotCount.toString(); 
                    board[rowCheck][colCheck].state = "unopened";
                }

                if (board[rowCheck][colCheck].state === "unopened" ) {
                    adjCell.textContent = board[rowCheck][colCheck].adjacentBunnies || '';
                    board[rowCheck][colCheck].state = "opened";
                    openedCells++;

                    if ((rowCheck + colCheck) % 2 === 0) {
                        adjCell.style.backgroundColor = '#c0b0d2'; // Light color
                    } else {
                        adjCell.style.backgroundColor = '#b1a3c1'; // Dark color
                    }

                    //Recursive call to reveal adjacent cells when none of them are bunnies
                    if (board[rowCheck][colCheck].adjacentBunnies === 0) {
                        revealChunk(adjCell);
                    }
                }
            }
        }
    }
}

/**
 * Win game when user successfully opens all non-bunny cells
 */
function winGame() {
    gameOver = true;
    var count = 0;

    setTimeout(() => { 
        const endPopup = document.getElementById('endPopup');
        const endMessage = document.getElementById('endMessage');
        endMessage.innerHTML = "You win!";

        replay.innerHTML = "Play again";
        replay.classList.add("replay");
        replay.addEventListener("click", () => resetGame());
        document.body.appendChild(replay);

        endPopup.style.zIndex = '11';
        endMessage.style.zIndex = '12';
        replay.style.zIndex = '13';
        
        endPopup.style.visibility = 'visible';
        endMessage.style.visibility = 'visible';
        replay.style.visibility = 'visible';
    }, (count) * 200);

}

/**
 * End game when user clicks on a bunny cell
 */
function endGame() {
    gameOver = true;
    let count = 0;

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col].isBunny) {
                const cellId = row.toString() + '-' + col.toString();
                const cell = document.getElementById(cellId);
                const delay = count * 200; 
    
                setTimeout(() => {
                    cell.innerHTML = bunny;
                }, delay);
    
                count++;
            }
        }
    }

    setTimeout(() => { 
        const endPopup = document.getElementById('endPopup');
        const endMessage = document.getElementById('endMessage');
        endMessage.innerHTML = "Game over!";

        replay.innerHTML = "Play again";
        replay.classList.add("replay");
        replay.addEventListener("click", () => resetGame());
        document.body.appendChild(replay);

        endPopup.style.zIndex = '11';
        endMessage.style.zIndex = '12';
        replay.style.zIndex = '13';

        endPopup.style.visibility = 'visible';
        endMessage.style.visibility = 'visible';
        replay.style.visibility = 'visible';
    }, (count) * 200);

}

/**
 * Reset game if user clicks the replay button
 */
function resetGame() { 
    openedCells = 0;
    carrotCount = 10;
    firstClick = true;
    gameOver = false;

    endPopup.style.zIndex = '0';
    endMessage.style.zIndex = '0';
    replay.style.zIndex = '0';

    endPopup.style.visibility = 'hidden';
    endMessage.style.visibility = 'hidden';
    replay.style.visibility = 'hidden';

    endPopup.innerHTML = '';
    endMessage.innerHTML = '';
    replay.innerHTML = '';
    replay.remove();

    board = Array.from({ length: 9 }, () => 
        Array.from({ length: 9 }, () => ({
            isBunny: false,   
            state: "unopened",    // "unopened" | "opened" | "flagged"
            adjacentBunnies: undefined
        }))
    );    

    const boardElement = document.getElementById('board');

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            let cellId = row.toString() + "-" + col.toString();
            let cell = document.getElementById(cellId);
            boardElement.removeChild(cell);
        }
    }

    setGame();
}