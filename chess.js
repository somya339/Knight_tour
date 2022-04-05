class Chess {
  constructor(size) {
    this.board = new Board(size);
    this.solution = [];
  }

  /*
      Triggers puzzle solving logic.
      Receives coordinates of initial square occupied by knight.
      By default, starts at upper-left corner of the board.
    */
  solvePuzzle(row = 0, col = 0) {
    return this.moveKnight(row, col);
  }

  /*
      Knight is at a particular position (row, col)
      Calculate next move, using recursive backtracking + heuristics
    */
  moveKnight(row, col) {
    let square = this.board.squares[row][col],
      { size } = this.board,
      { solution } = this;

    square.visited = true;
    solution.push(square);

    if (solution.length == size * size) {
      // all squares have been visited
      return true;
    }

    // get all possible moves from current location
    let moves = this.getPossibleMoves(row, col);

    // now sort them in heuristic order
    moves = this.heuristicSort(moves);

    // try all moves, see if any works
    for (let i = 0; i < moves.length; i++) {
      if (this.moveKnight(...moves[i])) {
        return true;
      }
    }

    // none worked, go back to previous square
    square.visited = false;
    solution.pop();

    return false;
  }

  /*
      Get all possible moves from current location
    */
  getPossibleMoves(row, col) {
    let { size } = this.board;

    let moves = [
      [row - 1, col + 2],
      [row + 1, col + 2],
      [row - 2, col + 1],
      [row + 2, col + 1],
      [row - 1, col - 2],
      [row + 1, col - 2],
      [row - 2, col - 1],
      [row + 2, col - 1],
    ];

    // eliminate squares outside the board boundaries,
    // and squares which have been already visited
    return moves.filter(([r, c]) => {
      return (
        r >= 0 &&
        c >= 0 &&
        r < size &&
        c < size &&
        !this.board.squares[r][c].visited
      );
    });
  }

  /*
        Sort possible moves in ascending order of accessibility,
        so least accessible squares are visitied first.
        By least accessible, we mean squares with least number of moves going forward.
    */
  heuristicSort(moves) {
    return moves.sort((m1, m2) => {
      return (
        this.getPossibleMoves(...m1).length -
        this.getPossibleMoves(...m2).length
      );
    });
  }
}

class Board {
  constructor(size) {
    this.size = size;
    this.squares = [];

    for (let r = 0; r < size; r++) {
      let row = [];

      for (let c = 0; c < size; c++) {
        let square = new Square(r, c);
        row.push(square);
      }

      this.squares.push(row);
    }
  }
}

class Square {
  constructor(row, col) {
    this.row = row;
    this.col = col;

    this.id = `${row}, ${col}`;
    this.visited = false;
  }
}

let chess,
  size = 8,
  timeout = 700;

window.onload = () => {
  paintMainBoard();
  playAgain();
};

/*
    Try another random solution
  */
function playAgain() {
  document.getElementById("btnPlayAgain").disabled = true;
  clearBoard();

  chess = new Chess(size);

  let row = random(0, 7),
    col = random(0, 7);

  paintKnight(row, col);

  if (chess.solvePuzzle(row, col)) {
    displaySolution();
  } else {
    console.log("Could not find a solution!!!");
  }
}

/*
    Display the solution in animated manner
  */
function displaySolution() {
  setTimeout(animation, timeout, 1);
}

/*
    Actual drawing routine
  */
function animation(i) {
  if (chess.solution.length == 1) {
    document.getElementById("btnPlayAgain").disabled = false;
    return;
  }

  // paint previous square as visited (display its visited running number)
  let square = chess.solution.splice(0, 1)[0];
  paintVisited(square.row, square.col, i);

  // paint knight at current square
  square = chess.solution[0];
  paintKnight(square.row, square.col);

  setTimeout(animation, timeout, i + 1);
}

/*
    Paints the chess board
  */
function paintMainBoard() {
  let board = document.getElementById("main-board"),
    classes = ["white-square", "dark-square"];

  for (let row = 0; row < size; row++) {
    let c = row % 2;

    for (let col = 0; col < size; col++) {
      let square = document.createElement("div");

      square.className = classes[c] + " " + "square";
      square.id = `${row}, ${col}`;

      board.appendChild(square);
      c = (c + 1) % 2;
    }
  }
}

/*
    Draw the knight at current square
  */
function paintKnight(row, col) {
  paintFontAwesome(row, col, "fas fa-chess-knight");
}

/*
    Visually mark square as visited
  */
function paintVisited(row, col, i) {
  paintHtml(row, col, i.toString(), "visited-square");
}

/*
    Reusable helper
  */
function paintFontAwesome(row, col, txt, cls) {
  let html = `<i class="${txt}"></i>`;
  paintHtml(row, col, html, cls);
}

/*
    Reusable helper
*/
function paintHtml(row, col, html, cls) {
  let square = chess.board.squares[row][col];
  let domSquare = document.getElementById(square.id);

  domSquare.innerHTML = html;

  if (cls) {
    domSquare.classList.add(cls);
  }
}

/*
    Clears the chess board
  */
function clearBoard() {
  if (chess == null) {
    return;
  }

  chess.board.squares.forEach((row) => {
    row.forEach((square) => {
      let domSquare = document.getElementById(square.id);

      domSquare.innerHTML = "";
      domSquare.classList.remove("visited-square");
    });
  });
}

function random(min, max) {
  let range = max - min + 1;
  return min + Math.floor(Math.random() * range);
}
