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
            this.checkDirection(row, col, -1, -1, moves);
            this.checkDirection(row, col, -1, 1, moves);
            this.checkDirection(row, col, 1, -1, moves);
            this.checkDirection(row, col, 1, 1, moves);
        } else {
            if (piece.color === 'red') {
                this.checkDirection(row, col, -1, -1, moves);
                this.checkDirection(row, col, -1, 1, moves);
            }
            if (piece.color === 'black') {
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

    
        if (this.isOnBoard(newRow, newCol) && !this.board[newRow][newCol]) {
            moves.push({ row: newRow, col: newCol });
        }

     
        const jumpRow = row + 2 * rowDir;
        const jumpCol = col + 2 * colDir;
        if (this.isOnBoard(jumpRow, jumpCol) &&
            !this.board[jumpRow][jumpCol] &&
            this.board[newRow][newCol] &&
            this.board[newRow][newCol].color !== piece.color) {
            moves.push({ row: jumpRow, col: jumpCol, capture: { row: newRow, col: newCol } });
        }    

    }



    /**
     * Make a move for the selected piece.
     * @param {number} row 
     * @param {number} col 
     * @returns {boolean} Whether the move was successful.
     */
    makeMove(row, col) {
        if (!this.selectedPiece) return false;
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
        this.board[fromRow][fromCol] = null;
        this.board[row][col] = piece;

        if (move.capture) {
            this.board[move.capture.row][move.capture.col] = null;
        }

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

    

    /**
     * Check if the current player has any available jumps (captures).
     * @returns {boolean} true if any jumps are available for the current player
     * Implementation of Force Jump Rule
     */
    hasForceJumps() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentPlayer) {
                    const jumpMoves = this.getJumpMovesForPiece(row, col);
                    if (jumpMoves.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Get only jump moves for a specific piece.
     * @param {number} row 
     * @param {number} col 
     * @returns {Array} List of available jump moves for the piece
     */
    getJumpMovesForPiece(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const jumpMoves = [];

        if (piece.isKing) {
   
            this.checkForJumpInDirection(row, col, -1, -1, jumpMoves);
            this.checkForJumpInDirection(row, col, -1, 1, jumpMoves);
            this.checkForJumpInDirection(row, col, 1, -1, jumpMoves);
            this.checkForJumpInDirection(row, col, 1, 1, jumpMoves);
        } else {
            if (piece.color === 'red') {
                this.checkForJumpInDirection(row, col, -1, -1, jumpMoves);
                this.checkForJumpInDirection(row, col, -1, 1, jumpMoves);
            }
            if (piece.color === 'black') {
                this.checkForJumpInDirection(row, col, 1, -1, jumpMoves);
                this.checkForJumpInDirection(row, col, 1, 1, jumpMoves);
            }
        }

        return jumpMoves;
    }

    /**
     * Check for a jump move in a specific direction.
     * @param {number} row starting row
     * @param {number} col starting column
     * @param {number} rowDir row direction (-1 or 1)
     * @param {number} colDir column direction (-1 or 1)
     * @param {Array} jumpMoves array to store found jump moves
     */
    checkForJumpInDirection(row, col, rowDir, colDir, jumpMoves) {
        const piece = this.board[row][col];
        const adjacentRow = row + rowDir;
        const adjacentCol = col + colDir;
        const jumpRow = row + 2 * rowDir;
        const jumpCol = col + 2 * colDir;

        if (this.isOnBoard(jumpRow, jumpCol) &&
            !this.board[jumpRow][jumpCol] &&
            this.board[adjacentRow] && this.board[adjacentRow][adjacentCol] &&
            this.board[adjacentRow][adjacentCol].color !== piece.color) {
            jumpMoves.push({ 
                row: jumpRow, 
                col: jumpCol, 
                capture: { row: adjacentRow, col: adjacentCol } 
            });
        }
    }

    /**
     * Filter moves to enforce force jump rule. If jumps are available, only return jumps.
     * @param {Array} allMoves all possible moves for a piece
     * @param {number} pieceRow row of the piece
     * @param {number} pieceCol column of the piece
     * @returns {Array} filtered moves according to force jump rules
     */
    applyForceJumpRule(allMoves, pieceRow, pieceCol) {
        const jumpMoves = this.getJumpMovesForPiece(pieceRow, pieceCol);
        
        if (jumpMoves.length > 0) {
            return jumpMoves;
        }

        if (this.hasForceJumps()) {
            return [];
        }
        
        return allMoves;
    }

    /**
     * Check if a piece can continue jumping from its current position.
     * Used after a capture to determine if multi-jump is possible.
     * @param {number} row current row position of the piece
     * @param {number} col current column position of the piece
     * @returns {boolean} true if the piece can make another jump
     */
    canContinueJumping(row, col) {
        const jumpMoves = this.getJumpMovesForPiece(row, col);
        return jumpMoves.length > 0;
    }



    /**
     * Handle multi-jump scenario after a capture move.
     * This function should be called after a successful jump to check for additional jumps.
     * @param {number} row row where the piece landed after the jump
     * @param {number} col column where the piece landed after the jump
     * @returns {Object} multi-jump status with continue flag and available moves
     */
    handleMultiJump(row, col) {
        if (this.canContinueJumping(row, col)) {
            const additionalJumps = this.getJumpMovesForPiece(row, col);
            
            return {
                canContinue: true,
                mustContinue: true, 
                availableMoves: additionalJumps,
                jumpingPiece: { row, col }
            };
        }
        
        return {
            canContinue: false,
            mustContinue: false,
            availableMoves: [],
            jumpingPiece: null
        };
    }

    /**
     * Execute a multi-jump sequence by temporarily keeping the same player active.
     * This integrates with the existing makeMove logic.
     * @param {number} fromRow starting row
     * @param {number} fromCol starting column  
     * @param {number} toRow destination row
     * @param {number} toCol destination column
     * @returns {Object} result of the multi-jump execution
     */
    executeMultiJump(fromRow, fromCol, toRow, toCol) {
        const multiJumpStatus = this.handleMultiJump(toRow, toCol);
        
        if (multiJumpStatus.canContinue) {
            return {
                continueJumping: true,
                selectedPiece: { row: toRow, col: toCol },
                validMoves: multiJumpStatus.availableMoves,
                switchPlayer: false
            };
        } else {
            return {
                continueJumping: false,
                selectedPiece: null,
                validMoves: [],
                switchPlayer: true  
            };
        }
    }

    /**
     * Check if the game is currently in a multi-jump state.
     * @returns {boolean} true if a multi-jump is in progress
     */
    isInMultiJumpState() {
        // A multi-jump state exists when:
        // 1. A piece is selected
        // 2. The selected piece has only jump moves available
        // 3. The last move was a capture
        if (!this.selectedPiece) return false;
        
        const moves = this.getJumpMovesForPiece(this.selectedPiece.row, this.selectedPiece.col);
        return moves.length > 0 && this.validMoves.every(move => move.capture);
    }

}
