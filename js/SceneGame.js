
/**
 * The main scene that draws the board.
 */
class SceneGame extends Phaser.Scene {

    constructor() {
        super("SceneGame");
        this.numRows = 6;
        this.numCols = 7;

        this.currentPlayer = 1;

        //board drawing info
        this.startX = 64;   //col
        this.startY = 100;   //row

        this.board; //2d int
        this.pieceSprites = [];

        this.ghostSprites = [];
        this.ghostRedSprites = [];
        this.ghostYellowSprites = [];

        this.initBoard();
    }

    preload() {
        this.load.image('piece-ghost', 'assets/img/ghost.png');
        this.load.image('piece-red', 'assets/img/red.png');
        this.load.image('piece-yellow', 'assets/img/yellow.png');

        this.load.image('board-back', 'assets/img/board-back.png');
        this.load.image('board-front', 'assets/img/board-front.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#dddddd'); //white

        this.drawBoard();
        this.drawGhosts();

        this.showGhosts();
    }

    resetGame() {
        this.pieceSprites = [];
        this.clearBoard();
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
     * Draws the front and back of the board.
     * Does not render the pieces.
     */
    drawBoard() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {

                let y = this.startY + (row * 64);
                let x = this.startX + (col * 64);

                this.add.sprite(x, y, 'board-back').setDepth(0);
                this.add.sprite(x, y, 'board-front').setDepth(2);
            }
        }
    }

    /**
     * draws the ghosts that the player may place their pieces on.
     * all hidden initially.
     */
    drawGhosts() {

        let y = this.startY - 64;
        for (let col = 0; col < this.numCols; col++) {
            let x = this.startX + (col * 64);

            let ghost = this.add.sprite(x, y, 'piece-ghost')
                .setInteractive()
                .on("pointerdown", this.ghostClicked)
                .on("pointerover", this.ghostHoverOn)
                .on("pointerout", this.ghostHoverOff)
                .setData("col", col)
                .setDepth(0);
            ghost.visible = false;

            this.ghostSprites.push(ghost);

            let ghostRed = this.add.sprite(x, y, 'piece-red')
                .setDepth(2)
                .setData("col", col);
            ghostRed.alpha = 0.2;
            ghostRed.visible = false;
            this.ghostRedSprites.push(ghostRed);

            let ghostYellow = this.add.sprite(x, y, 'piece-yellow')
                .setDepth(2)
                .setData("col", col);
            ghostYellow.alpha = 0.2;
            ghostYellow.visible = false;
            this.ghostYellowSprites.push(ghostRed);
        }
    }

    hideGhosts() {
        this.ghostSprites.forEach(sprite => {
            sprite.visible = false;
        });
    }

    showGhosts() {
        this.ghostSprites.forEach(sprite => {
            sprite.visible = true;
        });
    }

    ghostClicked() {
        let col = this.getData("col");

        /** @type {SceneGame}*/
        let scene = this.scene;

        scene.attemptMoveAndDraw(col);
    }

    /**
     * Whenever the mouse hovers over a ghost piece.
     * "this" is the button.
     */
    ghostHoverOn() {
        let col = this.getData("col");
        let scene = this.scene;

        if (scene.currentPlayer == 1)
            scene.ghostRedSprites[col].visible = true;
        else
            scene.ghostYellowSprites[col].visible = true;
    }

    /**
     * Whenever the mouse hovers off a ghost piece.
     * "this" is the button.
     */
    ghostHoverOff() {
        let col = this.getData("col");
        let scene = this.scene;

        if (scene.currentPlayer == 1)
            scene.ghostRedSprites[col].visible = false;
        else
            scene.ghostYellowSprites[col].visible = false;
    }

    attemptMoveAndDraw(col) {
        let rowPlaced = this.placePiece(col, this.currentPlayer);

        if (rowPlaced == -1)
            return;

        this.animatePlacePiece(rowPlaced, col, this.currentPlayer);

        if (this.currentPlayer == 1)
            this.currentPlayer = 2;
        else if (this.currentPlayer == 2)
            this.currentPlayer = 1;
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
     * Draws a piece dropping from top to bottom.
     * Does not place stuff in the data board.
     * use this instead: attemptMoveAndDraw();
     * @param {Number} placedRow
     * @param {Number} col
     * @param {Number} playerNum
     */
    animatePlacePiece(placedRow, col, playerNum) {
        let y = this.startY - 64;
        let x = this.startX + (col * 64);

        let spriteName = "piece-";
        if (playerNum == 1)
            spriteName += "red";
        else
            spriteName += "yellow";

        let newPiece = this.add.sprite(x, y, spriteName)
            .setDepth(1);

        let finalY = this.startY + (placedRow * 64);

        this.tweens.add({
            targets: newPiece,
            x: x,
            y: finalY,
            ease: "Linear",
            duration: 200
        });

        this.pieceSprites.push(newPiece);
    }

    checkVictory() {


    }
}
