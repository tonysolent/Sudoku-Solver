const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const server = require("../server");
const { puzzlesAndSolutions } = require("../controllers/puzzle-strings");

chai.use(chaiHttp);

suite("Functional Tests", () => {
  suite("/api/solve route tests", () => {
    const url = `/api/solve`;
    // Solve a puzzle with valid puzzle string: POST request to /api/solve
    test("Solve a puzzle with valid puzzle string: POST request to /api/solve", (done) => {
      for (let puzzle of puzzlesAndSolutions) {
        chai
          .request(server)
          .keepOpen()
          .post(url)
          .send({ puzzle: puzzle[0] })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            const result = JSON.parse(res.text);
            assert.deepEqual(result, { solution: puzzle[1] });
          });
      }
      done();
    });
    // Solve a puzzle with missing puzzle string: POST request to /api/solve
    test("Solve a puzzle with missing puzzle string: POST request to /api/solve", (done) => {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { error: "Required field missing" });
          done();
        });
    });
    // Solve a puzzle with invalid characters: POST request to /api/solve
    test("Solve a puzzle with invalid characters: POST request to /api/solve", (done) => {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          puzzle:
            "invalidcharacters1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1.",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { error: "Invalid characters in puzzle" });
          done();
        });
    });
    // Solve a puzzle with incorrect length: POST request to /api/solve
    test("Solve a puzzle with incorrect length: POST request to /api/solve", (done) => {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          puzzle: "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1.",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { error: "Expected puzzle to be 81 characters long" });
          done();
        });
    });
    // Solve a puzzle that cannot be solved: POST request to /api/solve
    test("Solve a puzzle that cannot be solved: POST request to /api/solve", (done) => {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          puzzle:
            "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.377",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { error: "Puzzle cannot be solved" });
          done();
        });
    });
  });
  suite("/api/check route tests", () => {
    const url = "/api/check";
    // Check a puzzle placement with all fields: POST request to /api/check
    test("Check a puzzle placement with all fields: POST request to /api/check", (done) => {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          puzzle:
            "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.",
          coordinate: "A2",
          value: 3,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { valid: true });
          done();
        });
    });
    // Check a puzzle placement with single placement conflict: POST request to /api/check
    test("Check a puzzle placement with single placement conflict: POST request to /api/check", (done) => {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          puzzle:
            "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.",
          coordinate: "A2",
          value: 8,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { valid: false, conflict: ["row"] });
          done();
        });
    });
    // Check a puzzle placement with multiple placement conflicts: POST request to /api/check
    test("Check a puzzle placement with multiple placement conflicts: POST request to /api/check", (done) => {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          puzzle:
            "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.",
          coordinate: "A2",
          value: 1,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { valid: false, conflict: ["row", "region"] });
          done();
        });
    });
    // Check a puzzle placement with all placement conflicts: POST request to /api/check
    test("Check a puzzle placement with all placement conflicts: POST request to /api/check", (done) => {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          puzzle:
            "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.",
          coordinate: "A2",
          value: 2,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { valid: false, conflict: ["row", "column", "region"] });
          done();
        });
    });
    // Check a puzzle placement with missing required fields: POST request to /api/check
    test("Check a puzzle placement with missing required fields: POST request to /api/check", (done) => {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          coordinate: "A2",
          value: 2,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { error: "Required field(s) missing" });
          done();
        });
    });
    // Check a puzzle placement with invalid characters: POST request to /api/check
    test("Check a puzzle placement with invalid characters: POST request to /api/check", (done) => {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          puzzle:
            "invalid84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.",
          coordinate: "A2",
          value: 2,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { error: "Invalid characters in puzzle" });
          done();
        });
    });
    // Check a puzzle placement with incorrect length: POST request to /api/check
    test("Check a puzzle placement with incorrect length: POST request to /api/check", (done) => {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          puzzle: "84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.",
          coordinate: "A2",
          value: 2,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { error: "Expected puzzle to be 81 characters long" });
          done();
        });
    });
    // Check a puzzle placement with invalid placement coordinate: POST request to /api/check
    test("Check a puzzle placement with invalid placement coordinate: POST request to /api/check", (done) => {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          puzzle:
            "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.",
          coordinate: "A12",
          value: 3,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { error: "Invalid coordinate" });
        });
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          puzzle:
            "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.",
          coordinate: "Z2",
          value: 3,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { error: "Invalid coordinate" });
        });
      done();
    });
    // Check a puzzle placement with invalid placement value: POST request to /api/check
    test("Check a puzzle placement with invalid placement coordinate: POST request to /api/check", (done) => {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          puzzle:
            "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.",
          coordinate: "A1",
          value: 0,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { error: "Invalid value" });
        });
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          puzzle:
            "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.",
          coordinate: "A1",
          value: 10,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { error: "Invalid value" });
        });
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          puzzle:
            "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.",
          coordinate: "A1",
          value: "invalid_string",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          const result = JSON.parse(res.text);
          assert.deepEqual(result, { error: "Invalid value" });
        });
      done();
    });
  });
});
