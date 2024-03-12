/*
 ** A Backtracking program in
 ** Javascript to solve Sudoku problem
 ** adapted from https://www.geeksforgeeks.org/sudoku-backtracking-7/
 ** by avanitrachhadiya2155
 */

class SudokuSolver {
  validate(puzzleString) {
    if (puzzleString.length !== 81) throw new Error("Expected puzzle to be 81 characters long");
    if (!/[.1-9]{81}/.test(puzzleString)) throw new Error("Invalid characters in puzzle");
    return true;
  }

  transformPuzzleString(puzzleString) {
    const puzzleArr = String(puzzleString).split("");
    const res = [];
    for (let i = 0; i < 9; i++) res.push(puzzleArr.splice(0, 9).map((el) => (el === "." ? 0 : el)));
    return res;
  }

  isSafe(puzzleArr, row, column, value) {
    if (!this.checkRowPlacement(puzzleArr, row, value)) return false;
    if (!this.checkColPlacement(puzzleArr, column, value)) return false;
    if (!this.checkRegionPlacement(puzzleArr, row, column, value)) return false;

    // If there is no clash, it's safe
    return true;
  }

  checkRowPlacement(puzzleArr, row, value) {
    // Row has the unique (row-clash)
    for (let d = 0; d < 9; d++) {
      if (puzzleArr[row][d] == value) return false;
    }
    return true;
  }

  checkColPlacement(puzzleArr, column, value) {
    // Column has the unique numbers (column-clash)
    for (let r = 0; r < 9; r++) {
      if (puzzleArr[r][column] == value) return false;
    }
    return true;
  }

  checkRegionPlacement(puzzleArr, row, column, value) {
    // Corresponding square has unique number (box-clash)
    let boxRowStart = row - (row % 3);
    let boxColStart = column - (column % 3);

    for (let r = boxRowStart; r < boxRowStart + 3; r++) {
      for (let d = boxColStart; d < boxColStart + 3; d++) {
        if (puzzleArr[r][d] == value) return false;
      }
    }

    return true;
  }

  isSolvable(puzzleArr) {
    // Validate input numbers
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const value = puzzleArr[r][c];
        puzzleArr[r][c] = 0;
        if (value !== 0 && !this.isSafe(puzzleArr, r, c, value)) return false;
        puzzleArr[r][c] = value;
      }
    }
    return true;
  }

  solve(puzzleArr, noValidate) {
    if (!noValidate && !this.isSolvable(puzzleArr)) return false;

    let row = -1;
    let col = -1;
    let isEmpty = true;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (puzzleArr[i][j] == 0) {
          row = i;
          col = j;

          // We still have some remaining missing values in Sudoku
          isEmpty = false;
          break;
        }
      }
      if (!isEmpty) break;
    }

    // No empty space left
    if (isEmpty) return puzzleArr;

    // Else for each-row backtrack
    for (let num = 1; num <= 9; num++) {
      if (this.isSafe(puzzleArr, row, col, num)) {
        puzzleArr[row][col] = num;
        if (this.solve(puzzleArr, true)) {
          return puzzleArr;
        } else {
          // Replace it
          puzzleArr[row][col] = 0;
        }
      }
    }

    return false;
  }
}

module.exports = SudokuSolver;
