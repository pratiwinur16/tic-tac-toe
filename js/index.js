function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}} /* AI STUFF (HOW THE COMPUTER DECIDES WHAT TO DO) */
function cpuMove() {
  movesMade++;

  if (winOrBlock('win')) return;else
  if (winOrBlock('block')) return;else
  if (goInCentre()) return;else
  if (coverOppositeCorners()) return;else
  if (coverAdjoiningEdges()) return;else
  if (offensiveMove()) return;else
  goInRemaining();
}

function winOrBlock(which) {
  var letter = which === 'win' ? 'O' : 'X';
  // Look for 2 in a row, where we can win or block a win
  var board = buildBoard();
  var twos = wins.filter(function (win) {return isPotentialLineForming(board, win, letter, 1);});

  if (twos.length === 0) {
    // We can't win/block on this turn
    return false;
  } else {
    // We can win/block! Grab one of the winning moves, and fill in the blank
    markOneOfThese(shuffle(twos).pop());
    return true;
  }
}

// Check if there are: two OR one matching letters out of three, with one OR two blank spaces
function isPotentialLineForming() {var board = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : buildBoard();var winningPattern = arguments[1];var letter = arguments[2];var blanksRequired = arguments[3];
  var blanks = 0;
  var letters = 0;

  for (var i = 0; i < winningPattern.length; i++) {
    var cellContents = cells[winningPattern[i]].textContent;
    if (cellContents === '') {
      blanks++;
    } else if (cellContents === letter) {
      letters++;
    }
  }
  if (blanksRequired === 1) {
    return blanks === 1 && letters === 2;
  } else {
    return blanks === 2 && letters === 1;
  }
}

function goInCentre() {
  if (isEmpty(4)) {
    markCell(4);
    return true;
  } else {
    return false;
  }
}

//  http://www.wikihow.com/Win-at-Tic-Tac-Toe
function coverOppositeCorners() {
  if (!oppositeCornerDanger()) return false;

  var middleEdges = shuffle([1, 3, 5, 7]);
  markOneOfThese(middleEdges);
  return true;
}

function oppositeCornerDanger() {
  var blankCorners = 0,opponentCorners = 0;
  var corners = [0, 2, 6, 8];
  corners.forEach(function (corner) {
    if (isEmpty(corner)) {
      blankCorners++;
    } else if (cells[corner].textContent === 'X') {
      opponentCorners++;
    }
  });
  return blankCorners === 2 && opponentCorners === 2;
}

/* Stop user from being able to win across two edges.
   * e.g. in the following situation: 
   * 
   *    - - O
   *    X O O
   *    - - X
   * 
   * The user could go in the bottom-left, and then we can't cover the win!
   * This is prevented by checking for two edges with one X in each.
  */
function coverAdjoiningEdges() {
  var dangerousCorner = [0, 2, 6, 8].filter(function (corner) {
    if (!isEmpty(corner)) return false;
    var board = buildBoard();
    // From a corner, can we see one other X in this column, and one in this row? If so, it must be blocked!
    return checkHorizontally(corner, board) && checkVertically(corner, board);
  });

  if (dangerousCorner.length === 0) {
    return false;
  } else {
    markOneOfThese(dangerousCorner);
    return true;
  }
}

function checkHorizontally(corner, board) {
  var cell1 = void 0,cell2 = void 0;
  if (corner % 3 === 0) {// left column
    cell1 = corner + 1;
    cell2 = corner + 2;
  } else {// right column
    cell1 = corner - 1;
    cell2 = corner - 2;
  }
  return oneEmptyOneX(board, cell1, cell2);
}

function checkVertically(corner, board) {
  var cell1 = void 0,cell2 = void 0;
  if (corner < 3) {// top row
    cell1 = corner + 3;
    cell2 = corner + 6;
  } else {// bottom row
    cell1 = corner - 3;
    cell2 = corner - 6;
  }
  return oneEmptyOneX(board, cell1, cell2);
}

function oneEmptyOneX(board, cell1, cell2) {
  return board[cell1] === 'X' && board[cell2] === '' ||
  board[cell1] === '' && board[cell2] === 'X';
}

function offensiveMove() {
  // Look for a 'O' with two blank spaces, where we can make it one away from a win
  var board = buildBoard();
  var moves = wins.filter(function (win) {return isPotentialLineForming(board, win, 'O', 2);});

  if (moves.length === 0) {
    // We can't go one the offensive on this turn
    return false;
  } else {
    // We can! Grab one of the winning moves, and get one step closer to it
    markOneOfThese(shuffle(moves).pop());
    return true;
  }
}

function goInRemaining() {
  var corners = shuffle([0, 2, 6, 8]);
  var remaining = shuffle([1, 3, 5, 7]);
  markOneOfThese([].concat(_toConsumableArray(corners), _toConsumableArray(remaining)));
}

function markOneOfThese(potentialMoves) {
  for (var i = 0; i < potentialMoves.length; i++) {
    if (isEmpty(potentialMoves[i])) {
      markCell(potentialMoves[i]);
      return true;
    }
  }
  return false;
}

function markCell(index) {
  cells[index].textContent = 'O';
  cells[index].classList.add('red');
}

function shuffle(arr) {
  return arr.sort(function () {return 0.5 - Math.random();});
}


/* EVERYTHING ELSE */

var cells = document.querySelectorAll('.cell');

var wins = [
[0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
[0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical
[0, 4, 8], [2, 4, 6] // diagonal
];

var movesMade = 0;

function makeMove() {
  if (!isEmpty(this.dataset.index)) return;

  stopClicks();

  this.textContent = 'X';
  this.classList.add('blue');
  movesMade++;

  if (isGameOver('Player')) return;

  // Allow a little time for DOM to update (and simulate 'thinking')
  setTimeout(function () {
    cpuMove();
    if (!isGameOver('CPU')) allowClicks();
  }, 500);
}

function isGameOver(lastPlayer) {
  if (checkForWinner()) {
    gameOver(lastPlayer);
    return true;
  } else if (checkForDraw()) {
    gameOver('Draw');
    return true;
  } else {
    return false;
  }
}

function checkForWinner() {
  var board = buildBoard();

  // Check the board against 'wins' array
  var result = false;
  wins.forEach(function (win) {
    if (threeInARow.apply(undefined, [board].concat(_toConsumableArray(win)))) {
      result = true;
    }
  });
  return result;
}

// Build array to represent the board
function buildBoard() {
  var board = [];
  cells.forEach(function (c) {return board.push(c.textContent);});
  return board;
}

function checkForDraw() {
  return movesMade >= 9;
}

function isEmpty(index) {
  return cells[index].textContent === '';
}

function threeInARow(board, first, second, third) {
  var b = board;
  return b[first] !== '' && b[first] === b[second] && b[second] === b[third];
}

function gameOver(winner) {
  // Allow a little time for DOM to update
  setTimeout(function () {
    winner === 'Draw' ? alert('It\'s a draw!') : alert(winner + ' wins!');
    newGame();
  }, 15);
}

function newGame() {
  movesMade = 0;
  cells.forEach(function (c) {
    c.classList.remove('blue', 'red');
    c.textContent = '';
  });
  // Refreshing the clicks like this fixes a pesky bug where sometimes no clicks are allowed
  stopClicks();
  allowClicks();
}

function allowClicks() {
  cells.forEach(function (c) {return c.addEventListener('click', makeMove);});
}

function stopClicks() {
  cells.forEach(function (c) {return c.removeEventListener('click', makeMove);});
}

allowClicks();