"use strict";

const SudokuSolver = require("../controllers/sudoku-solver.js");

module.exports = function (app) {
  let solver = new SudokuSolver();

  app.route("/api/check").post((req, res) => {
    try {
      let { puzzle, coordinate, value } = req.body;
      if (puzzle === undefined || coordinate === undefined || value === undefined)
        return res.json({ error: "Required field(s) missing" });
      solver.validate(puzzle);
      if (coordinate.length !== 2 || !/[a-i][1-9]/i.test(coordinate))
        return res.json({ error: "Invalid coordinate" });
      value = parseInt(value);
      if (isNaN(value) || value < 1 || value > 9) return res.json({ error: "Invalid value" });

      const rowIndex = coordinate[0].toUpperCase().charCodeAt() - 65;
      const colIndex = Number(coordinate[1]) - 1;
      const puzzleArr = solver.transformPuzzleString(puzzle);

      let result = {
        valid: true,
      };

      const currentCell = parseInt(puzzleArr[rowIndex][colIndex]);
      if (currentCell !== 0 && currentCell === value) return res.json(result);

      if (!solver.checkRowPlacement(puzzleArr, rowIndex, value)) {
        result = {
          valid: false,
          conflict: ["row"],
        };
      }
      if (!solver.checkColPlacement(puzzleArr, colIndex, value)) {
        result = {
          valid: false,
          conflict: [...(result.conflict || []), "column"],
        };
      }
      if (!solver.checkRegionPlacement(puzzleArr, rowIndex, colIndex, value)) {
        result = {
          valid: false,
          conflict: [...(result.conflict || []), "region"],
        };
      }

      return res.json(result);
    } catch (er) {
      return res.send({ error: er.message });
    }
  });

  app.route("/api/solve").post((req, res) => {
    const { puzzle } = req.body;
    if (!puzzle) return res.json({ error: "Required field missing" });
    try {
      solver.validate(puzzle);
      const puzzleArr = solver.transformPuzzleString(puzzle);
      const result = solver.solve(puzzleArr);
      if (result) {
        const solution = result.map((el) => el.join("")).join("");
        return res.json({ solution });
      } else {
        return res.json({ error: "Puzzle cannot be solved" });
      }
    } catch (er) {
      return res.json({ error: er.message });
    }
  });
};
