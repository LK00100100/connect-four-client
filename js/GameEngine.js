/**
 * contains data of the connect 4 game.
 * no drawing data.
 */
class GameEngine {

    constructor() {
        this.numRows = 6;
        this.numCols = 7;

        this.currentPlayer = 1; //1 = red, 2 = yellow (ABC ordered)

        this.board; //2d int

        this.initBoard();
    }

    /**
     * initializes the board with 0's.
     */
    initBoard() {
        this.board = [];
        for (let row = 0; row < this.numRows; row++) {
            let newRow = [];
            for (let col = 0; col < this.numCols; col++)
                newRow.push(0);

            this.board.push(newRow);
        }
    }


    clearBoard() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                this.board[row][col] = 0;
            }
        }
    }

    /**
     * drops a piece in the column.
     * affects the data only.
     * use this instead: attemptMoveAndDraw();
     * @param {Number} col -
     * @param {Number} playerNum -
     * @returns {Number} the row of the piece played. otherwise -1;
     */
    placePiece(col, playerNum) {
        let pieceWasPlaced = false;
        let row = 0;

        if (this.board[row][col] != 0)
            return -1;

        //check each spot to see if there's something below it.
        for (; row < this.numRows; row++) {
            if (row == this.numRows - 1) {
                this.board[row][col] = playerNum;
                pieceWasPlaced = true;
                break;
            }

            //is there anything below?
            if (this.board[row + 1][col] != 0) {
                this.board[row][col] = playerNum;
                pieceWasPlaced = true;
                break;
            }
        }

        if (pieceWasPlaced)
            return row;
        else
            return -1;
    }

    /**
     * Quickly check if the newly placed piece created a victory.
     * @param {Number} row the newly placed piece
     * @param {Number} col the newly placed piece
     */
    checkVictoryQuick(row, col) {
        let player = this.board[row][col];

        if (this.checkHorizontalQuick(row, col - 3, player)) //to left
            return true;

        if (this.checkHorizontalQuick(row, col, player)) //to right
            return true;

        if (this.checkVerticalQuick(row, col, player)) //to down
            return true;

        if (this.checkDiagonalSEQuick(row, col, player))
            return true;

        if (this.checkDiagonalSWQuick(row, col, player))
            return true;

        if (this.checkDiagonalSEQuick(row - 3, col - 3, player))
            return true;

        if (this.checkDiagonalSWQuick(row - 3, col + 3, player))
            return true;

        return false;
    }

    /**
     * Checks four horizontal from left to right
     * @param {Number} row 
     * @param {Number} col 
     * @param {Number} player 
     */
    checkHorizontalQuick(row, col, player) {
        for (let i = 0; i < 4; i++) {
            if (this.isOutOfBounds(row, col + i))
                return false;

            if (this.board[row][col + i] != player)
                return false;
        }

        return true;
    }

    /**
     * Checks four vertical from top to bottom
     * @param {Number} row 
     * @param {Number} col 
     * @param {Number} player 
     * @returns {Boolean} 
     */
    checkVerticalQuick(row, col, player) {
        for (let i = 0; i < 4; i++) {
            if (this.isOutOfBounds(row + i, col))
                return false;

            if (this.board[row + i][col] != player)
                return false;
        }

        return true;
    }

    /**
    * Checks four diagonal towards south-east
    * @param {Number} row 
    * @param {Number} col 
    * @param {Number} player 
    * @returns {Boolean} 
    */
    checkDiagonalSEQuick(row, col, player) {
        for (let i = 0; i < 4; i++) {
            if (this.isOutOfBounds(row + i, col + i))
                return false;

            if (this.board[row + i][col + i] != player)
                return false;
        }

        return true;
    }

    /**
     * Checks four diagonal towards south-west
     * @param {Number} row 
     * @param {Number} col 
     * @param {Number} player 
     * @returns {Boolean} 
     */
    checkDiagonalSWQuick(row, col, player) {
        for (let i = 0; i < 4; i++) {
            if (this.isOutOfBounds(row + i, col - i))
                return false;

            if (this.board[row + i][col - i] != player)
                return false;
        }

        return true;
    }

    /**
     * 
     * @param {Number} row 
     * @param {Number} col 
     * @returns {boolean} true if out of bounds.
     */
    isOutOfBounds(row, col) {
        if (row < 0 || row >= this.board.length)
            return true;

        if (col < 0 || col >= this.board[0].length)
            return true;

        return false;
    }

    /**
     * This just checks the top row to see if the board is full.
     * @returns {Boolean}
     */
    isBoardFull() {
        for (let col = 0; col < this.numCols; col++) {
            if (this.board[0][col] == 0)
                return false;
        }

        return true;
    }

}