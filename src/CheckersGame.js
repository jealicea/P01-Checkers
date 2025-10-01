// CheckersGame.js
// Logic for Checkers
// CheckersGame.js
export class CheckersGame {

    constructor() {
        this.board = null;
        this.currentPlayer = null;
        this.selectedPiece = null;
        this.validMoves = [];
        this.isGameOver = false;

        this.reset();
    }


    /**
     * Resets the game to the initial state.
     */
    reset() {
        this.board = this.createBoard();
        this.currentPlayer = 'red'; // red starts
        this.selectedPiece = null;
        this.validMoves = [];
        this.isGameOver = false;
    }

    createBoard() {

    }

    selectPiece(row, col) {

    }

    deselectPiece() {

    }

    getValidMoves(row, col) {

    }

    makeMove(row, col) {

    }

    switchPlayer() {

    }

    isOnBoard(row, col) {

    }
}
