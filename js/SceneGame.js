
/**
 * The main scene that draws the board.
 */
class SceneGame extends Phaser.Scene {

    constructor() {
        super("SceneGame");

        //board drawing info
        this.startX = 64;   //col
        this.startY = 100;   //row

        this.pieceSprites = [];

        this.ghostSprites = [];
        this.ghostRedSprites = [];
        this.ghostYellowSprites = [];

        this.piecePlacedSound;

        this.gameEngine = new GameEngine();
    }

    preload() {
        this.load.image('piece-ghost', 'assets/img/ghost.png');
        this.load.image('piece-red', 'assets/img/red.png');
        this.load.image('piece-yellow', 'assets/img/yellow.png');

        this.load.image('board-back', 'assets/img/board-back.png');
        this.load.image('board-front', 'assets/img/board-front.png');

        this.load.image('btn-reset', 'assets/img/btn-reset.png');

        /** Audio */
        this.load.audio('piece-placed', ['assets/audio/squit.ogg']);
    }

    create() {
        this.cameras.main.setBackgroundColor('#dddddd'); //white

        this.piecePlacedSound = this.sound.add("piece-placed");

        this.drawBoardBackground();
        this.drawGhosts();

        this.showGhosts();

        this.drawResetButton();
    }

    resetGame() {
        this.pieceSprites.forEach(sprite => {
            sprite.destroy();
        })
        this.pieceSprites = [];
        this.gameEngine.clearBoard();
    }

    /**
     * Draws the front and back of the board.
     * Does not render the pieces.
     */
    drawBoardBackground() {
        for (let row = 0; row < this.gameEngine.numRows; row++) {
            for (let col = 0; col < this.gameEngine.numCols; col++) {

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
        for (let col = 0; col < this.gameEngine.numCols; col++) {
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
            this.ghostYellowSprites.push(ghostYellow);
        }
    }

    drawResetButton() {
        this.add.sprite(540, 150, 'btn-reset')
            .setInteractive()
            .on("pointerdown", this.resetGame.bind(this));
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

        if (scene.gameEngine.currentPlayer == 1)
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

        if (scene.gameEngine.currentPlayer == 1)
            scene.ghostRedSprites[col].visible = false;
        else
            scene.ghostYellowSprites[col].visible = false;
    }

    /**
     * attempts to place a piece down in the col (for current player) and draws it.
     * On an invalid, nothing happens.
     * @param {Number} col the target column
     */
    attemptMoveAndDraw(col) {
        let rowPlaced = this.gameEngine.placePiece(col, this.gameEngine.currentPlayer);

        if (rowPlaced == -1)
            return;

        this.animatePlacePiece(rowPlaced, col, this.gameEngine.currentPlayer);

        this.piecePlacedSound.play();

        let isWinner = this.gameEngine.checkVictoryQuick(rowPlaced, col);

        if (isWinner) {
            alert(`player ${this.gameEngine.currentPlayer} winner`);
        }
        else {
            if (this.gameEngine.isBoardFull())
                alert("no winner");
        }

        //END OF TURN
        //change player and change ghost
        if (this.gameEngine.currentPlayer == 1) {
            this.gameEngine.currentPlayer = 2;

            this.ghostRedSprites[col].visible = false;
            this.ghostYellowSprites[col].visible = true;
        }
        else if (this.gameEngine.currentPlayer == 2) {
            this.gameEngine.currentPlayer = 1;

            this.ghostRedSprites[col].visible = true;
            this.ghostYellowSprites[col].visible = false;
        }

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
            duration: 300
        });

        this.pieceSprites.push(newPiece);
    }

}
