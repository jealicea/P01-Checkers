// CheckersGame.js
// Logic for Checkers

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
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.isGameOver = false;
    }

    /**
     * Create the initial board setup.
     * @returns {Array} The initial board state.
     */
    createBoard() {
        const board = [];
        for (let row = 0; row < 8; row++) {
            const newRow = [];
            for (let col = 0; col < 8; col++) {
                if (row < 3 && (row + col) % 2 === 1) {
                    newRow.push({ color: 'black', player: 'black', isKing: false });
                } else if (row > 4 && (row + col) % 2 === 1) {
                    newRow.push({ color: 'red', player: 'red', isKing: false });
                } else {
                    newRow.push(null);
                }
            }
            board.push(newRow);
        }
        return board;
    }

    /**
     * Select a piece on the board.
     * @param {number} row 
     * @param {number} col 
     * @returns {boolean} Whether the selection was successful.
     */
    selectPiece(row, col) {
        const piece = this.board[row][col];
        if (!piece) return false;

        if (piece.color === this.currentPlayer) {
            this.selectedPiece = { row, col };
            this.validMoves = this.getValidMoves(row, col);
            return true;
        }
        return false;
    }

    /**
     * Deselect the currently selected piece.
     */
    deselectPiece() {
        this.selectedPiece = null;
        this.validMoves = [];
    }


    /**
     * Get valid moves for a piece at (row, col).
     * @param {number} row 
     * @param {number} col 
     * @returns {Array} List of valid move positions.
     */
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];

        if (piece.isKing) {
            // Kings can move in all four diagonal directions
            this.checkDirection(row, col, -1, -1, moves);
            this.checkDirection(row, col, -1, 1, moves);
            this.checkDirection(row, col, 1, -1, moves);
            this.checkDirection(row, col, 1, 1, moves);
        } else {
            if (piece.color === 'red') {
                // Red pieces move towards row 0
                this.checkDirection(row, col, -1, -1, moves);
                this.checkDirection(row, col, -1, 1, moves);
            }
            if (piece.color === 'black') {
                // Black pieces move towards row 7
                this.checkDirection(row, col, 1, -1, moves);
                this.checkDirection(row, col, 1, 1, moves);
            }
        }

        return moves;
    }

    checkDirection(row, col, rowDir, colDir, moves) {
        const piece = this.board[row][col];
        const newRow = row + rowDir; 
        const newCol = col + colDir;

        // Normal move
        if (this.isOnBoard(newRow, newCol) && !this.board[newRow][newCol]) {
            moves.push({ row: newRow, col: newCol });
        }

        // Capture move
        const jumpRow = row + 2 * rowDir;
        const jumpCol = col + 2 * colDir;
        if (this.isOnBoard(jumpRow, jumpCol) &&
            !this.board[jumpRow][jumpCol] &&
            this.board[newRow][newCol] &&
            this.board[newRow][newCol].color !== piece.color) {
            moves.push({ row: jumpRow, col: jumpCol, capture: { row: newRow, col: newCol } });
        }
        // TODO: Implement force Jumps and Multi-Jumps

    }

    /**
     * Make a move for the selected piece.
     * @param {number} row 
     * @param {number} col 
     * @returns {boolean} Whether the move was successful.
     */
    makeMove(row, col) {
        if (!this.selectedPiece) return false;

        // Find the move in validMoves
        let move = null;
        for (let i = 0; i < this.validMoves.length; i++) {
            if (this.validMoves[i].row === row && this.validMoves[i].col === col) {
                move = this.validMoves[i];
                break;
            }
        }
        if (!move) return false; 

        const fromRow = this.selectedPiece.row;
        const fromCol = this.selectedPiece.col;
        const piece = this.board[fromRow][fromCol];

        // Move piece
        this.board[fromRow][fromCol] = null;
        this.board[row][col] = piece;

        // Handle a capture
        if (move.capture) {
            this.board[move.capture.row][move.capture.col] = null;
        }

        // Turn piece into king
        if ((piece.color === 'red' && row === 0) || (piece.color === 'black' && row === 7)) {
            piece.isKing = true;
        }

        this.deselectPiece();
        this.switchPlayer();
        return true;

    }

    /**
     * Switch the current player.
     */
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
    }

    /**
     * Check if the position is on the board.
     * @param {number} row the row index
     * @param {number} col the column index
     * @returns {boolean} true if the position is on the board, false otherwise
     */
    isOnBoard(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
}
