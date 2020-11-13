
/**
 * The main scene that draws the board.
 */
class SceneGame extends Phaser.Scene {

    constructor() {
        super("SceneGame");
        this.numRows = 6;
        this.numCols = 7;

        this.startX = 64;   //col
        this.startY = 64;   //row

        this.board; //2d int

        this.initBoard();
    }

    preload() {
        this.load.image('piece-red', 'assets/img/red.png');
        this.load.image('piece-yellow', 'assets/img/yellow.png');
        this.load.image('board-front', 'assets/img/board-front.png');
        this.load.image('board-back', 'assets/img/board-back.png');
    }

    create() {
        this.drawBoard();
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

    /**
     * Draws the front and back of the board.
     * Does not render the pieces.
     */
    drawBoard() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {

                let y = this.startY + (row * 64);
                let x = this.startX + (col * 64);

                this.add.sprite(x, y, 'board-back');
                this.add.sprite(x, y, 'board-front');
            }
        }
    }

    checkVictory() {


    }
}
