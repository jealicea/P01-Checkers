/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/CheckersGame.js":
/*!*****************************!*\
  !*** ./src/CheckersGame.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   CheckersGame: () => (/* binding */ CheckersGame)\n/* harmony export */ });\n// CheckersGame.js\n// Logic for Checkers\n\nclass CheckersGame {\n\n    constructor() {\n        this.board = null;\n        this.currentPlayer = null;\n        this.selectedPiece = null;\n        this.validMoves = [];\n        this.isGameOver = false;\n\n        this.reset();\n    }\n\n    /**\n     * Resets the game to the initial state.\n     */\n    reset() {\n        this.board = this.createBoard();\n        this.currentPlayer = 'red';\n        this.selectedPiece = null;\n        this.validMoves = [];\n        this.isGameOver = false;\n    }\n\n    /**\n     * Create the initial board setup.\n     * @returns {Array} The initial board state.\n     */\n    createBoard() {\n        const board = [];\n        for (let row = 0; row < 8; row++) {\n            const newRow = [];\n            for (let col = 0; col < 8; col++) {\n                if (row < 3 && (row + col) % 2 === 1) {\n                    newRow.push({ color: 'black', player: 'black', isKing: false });\n                } else if (row > 4 && (row + col) % 2 === 1) {\n                    newRow.push({ color: 'red', player: 'red', isKing: false });\n                } else {\n                    newRow.push(null);\n                }\n            }\n            board.push(newRow);\n        }\n        return board;\n    }\n\n    /**\n     * Select a piece on the board.\n     * @param {number} row \n     * @param {number} col \n     * @returns {boolean} Whether the selection was successful.\n     */\n    selectPiece(row, col) {\n        const piece = this.board[row][col];\n        if (!piece) return false;\n\n        if (piece.color === this.currentPlayer) {\n            this.selectedPiece = { row, col };\n            this.validMoves = this.getValidMoves(row, col);\n            return true;\n        }\n        return false;\n    }\n\n    /**\n     * Deselect the currently selected piece.\n     */\n    deselectPiece() {\n        this.selectedPiece = null;\n        this.validMoves = [];\n    }\n\n\n    /** \n     * Get valid moves for a piece at (row, col).\n     * @param {number} row \n     * @param {number} col \n     * @returns {Array} List of valid move positions.\n     */\n    getValidMoves(row, col) {\n        const piece = this.board[row][col];\n        if (!piece) return [];\n\n        const moves = [];\n        const directions = [];\n\n        if (piece.isKing) {\n            directions.push(\n                { rowDirection: -1, colDirection: -1 }, { rowDirection: -1, colDirection: 1 },\n                { rowDirection: 1, colDirection: -1 }, { rowDirection: 1, colDirection: 1 }\n            );\n        } else {\n            if (piece.color === 'red') {\n                directions.push({ rowDirection: -1, colDirection: -1 }, { rowDirection: -1, colDirection: 1 });\n            }\n            if (piece.color === 'black') {\n                directions.push({ rowDirection: 1, colDirection: -1 }, { rowDirection: 1, colDirection: 1 });\n            }\n        }\n\n        for (const { rowDirection, colDirection } of directions) {\n            const newRow = row + rowDirection; \n            const newCol = col + colDirection;\n            // Normal move\n            if (this.isOnBoard(newRow, newCol) && !this.board[newRow][newCol]) {\n                moves.push({ row: newRow, col: newCol });\n            }\n            // Capture move\n            const jumpRow = row + 2 * rowDirection;\n            const jumpCol = col + 2 * colDirection;\n            if (this.isOnBoard(jumpRow, jumpCol) &&\n                !this.board[jumpRow][jumpCol] &&\n                this.board[newRow][newCol] &&\n                this.board[newRow][newCol].color !== piece.color) {\n                moves.push({ row: jumpRow, col: jumpCol, capture: { row: newRow, col: newCol } });\n            }\n        }\n        return moves;\n    }\n\n    /**\n     * Make a move for the selected piece.\n     * @param {number} row \n     * @param {number} col \n     * @returns {boolean} Whether the move was successful.\n     */\n    makeMove(row, col) {\n        if (!this.selectedPiece) return false;\n        const move = this.validMoves.find(m => m.row === row && m.col === col); // Find the move in validMoves\n        if (!move) return false; \n\n        const { row: fromRow, col: fromCol } = this.selectedPiece;\n        const piece = this.board[fromRow][fromCol];\n\n        // Move piece\n        this.board[fromRow][fromCol] = null;\n        this.board[row][col] = piece;\n\n        // Handle a capture\n        if (move.capture) {\n            this.board[move.capture.row][move.capture.col] = null;\n        }\n\n        // Turn piece into king\n        if ((piece.color === 'red' && row === 0) || (piece.color === 'black' && row === 7)) {\n            piece.isKing = true;\n        }\n\n        this.deselectPiece();\n        this.switchPlayer();\n        return true;\n\n    }\n\n    /**\n     * Switch the current player.\n     */\n    switchPlayer() {\n        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';\n    }\n\n    /**\n     * Check if the position is on the board.\n     * @param {number} row the row index\n     * @param {number} col the column index\n     * @returns {boolean} true if the position is on the board, false otherwise\n     */\n    isOnBoard(row, col) {\n        return row >= 0 && row < 8 && col >= 0 && col < 8;\n    }\n}\n\n\n//# sourceURL=webpack://checkers-game/./src/CheckersGame.js?\n}");

/***/ }),

/***/ "./src/checkers2d.js":
/*!***************************!*\
  !*** ./src/checkers2d.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _CheckersGame_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CheckersGame.js */ \"./src/CheckersGame.js\");\n/**\n * Checkers 2D Game.\n * \n * This file is complete. It can be used to confirm that the CheckersGame class\n * is working correctly.\n */\n\n\n\n/**\n * Load the game and render the board.\n */\nwindow.addEventListener('load', () => {\n    const game = new _CheckersGame_js__WEBPACK_IMPORTED_MODULE_0__.CheckersGame();\n    const boardElement = document.getElementById('gameBoard');\n\n    /**\n     * Render the game board.\n     */\n    function render() {\n        // Render board\n        const selectedPiece = game.selectedPiece;\n        const validMoves = game.validMoves;\n        boardElement.innerHTML = '';\n        for (let row = 0; row < 8; row++) {\n            for (let col = 0; col < 8; col++) {\n                const cell = document.createElement('div');\n                cell.className = 'cell';\n                \n                // Alternate cell colors\n                cell.classList.add((row + col) % 2 ? 'dark' : 'light');\n                \n                // Highlight selected piece\n                if (posMatch(selectedPiece, { row, col })) {\n                    cell.classList.add('selected');\n                }\n\n                // Highlight valid moves\n                if (validMoves.some(move => posMatch(move, { row, col }))) {\n                    cell.classList.add('valid-move');\n                }\n\n                // Add piece if exists\n                const piece = game.board[row][col];\n                if (piece) {\n                    const pieceElement = document.createElement('div');\n                    pieceElement.className = `piece ${piece.color}`;\n                    if (piece.isKing) { pieceElement.classList.add('king'); }\n                    cell.appendChild(pieceElement);\n                }\n                \n                cell.addEventListener('click', () => handleCellClick(row, col));\n                boardElement.appendChild(cell);\n            }\n        }\n    }\n\n    /**\n     * Handle the click event on a cell.\n     * @param {number} row the row of the cell\n     * @param {number} col the column of the cell\n     */\n    function handleCellClick(row, col) {\n        if (game.isGameOver) { return; }\n        if (!game.selectPiece(row, col) && !game.makeMove(row, col)) {\n            game.deselectPiece();\n        }\n        render();\n    }\n\n    // Reset the game\n    document.getElementById('resetButton').addEventListener('click', () => {\n        game.reset();\n        render();\n    });\n\n    // Initial rendering of the game\n    render();\n});\n\n/**\n * Check if two positions match\n * @param {object} pos1 the first position { row: number, col: number }\n * @param {object} pos2 the second position { row: number, col: number }\n * @returns {boolean} true if the positions match, false otherwise\n */\nfunction posMatch(pos1, pos2) {\n    return pos1 && pos2 && pos1.row === pos2.row && pos1.col === pos2.col;\n}\n\n\n//# sourceURL=webpack://checkers-game/./src/checkers2d.js?\n}");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/checkers2d.js");
/******/ 	
/******/ })()
;