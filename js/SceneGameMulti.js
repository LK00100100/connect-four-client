//TODO: on disconnect, don't attempt resync. you rage quitted.
//TODO: get a playernumber assigned when joining a server
//TODO: wait until you get a seat before showing the board.

//TODO: on join, get all current players

/**
 * The main scene that draws the board.
 * With multiplayer logic
 */
class SceneGameMulti extends Phaser.Scene {

    //TODO: separate web code
    constructor() {
        super("SceneGameMulti");

        this.con4ServerUrl = "http://localhost:5000";   //TODO: settable

        //board drawing info
        this.startX = 64;   //col
        this.startY = 100;   //row

        this.pieceSprites = [];

        this.ghostSprites = [];
        this.ghostRedSprites = [];
        this.ghostYellowSprites = [];

        this.piecePlacedSound;

        this.gameEngine = new GameEngine();

        /**
         * Multiplayer data for this game instance.
         * Initialized by initScene()
         */
        this.targetWebsocket = "http://localhost:5000/con4-ws";
        this.stompClient = null;

        this.gameId;   //set by server.
        this.myUserId = "user" + Date.now(); //TODO: rely on the servers to give you an actual id.
        this.myPlayerNum;   //set by server
        this.players;
        this.gameState; //values of: WAIT, PLAY, END
    }

    /**
     * Call this everytime before showing this scene to get things set up.
     */
    initScene(newGameId) {
        $("#game-text").text("");

        //some of these will be set by the server.
        this.stompClient = null;
        this.gameId = newGameId;
        this.myPlayerNum = -1;
        this.players = [];
        this.gameState = "WAIT";

        this.getGameInstance(newGameId,
            function () {
                this.connectToWebSocket(newGameId);
            }.bind(this)
        );

        this.clearBoard();

    }

    /**
     * download the latest game instance.
     * then setup websockets.
     * Called once once by initScene();
     * @param {String} newGameId 
     * @param {Function} callback called at the end
     */
    getGameInstance(newGameId, callback) {
        let targetUrl = this.con4ServerUrl + `/game/${newGameId}`;

        $.get(targetUrl, function (data) {
            this.players = data.players;

            if (callback != null)
                callback();

        }.bind(this));
    }

    /**
     * Called only once by phaser to preload assets.
     */
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

    /**
     * Called only once by phaser.
     */
    create() {
        this.cameras.main.setBackgroundColor('#dddddd'); //white-ish

        this.piecePlacedSound = this.sound.add("piece-placed");

        this.drawBoardBackground();
        this.drawGhosts();

        this.showGhosts();
    }

    /**
     * Connects to various web sockets. Called only by initGame();
     * @param {String} newGameId the unique game id we are going to play on
     */
    connectToWebSocket(newGameId) {
        //var socket = new SockJS('/gs-guide-websocket');
        var socket = new SockJS(this.targetWebsocket);

        this.stompClient = Stomp.over(socket);
        let stompClient = this.stompClient;

        stompClient.connect({}, function (frame) {
            //setConnected(true);   //TODO: show the user they are connected on the UI
            console.log('Connected: ' + frame);

            //any moves
            let subscribeTo = `/topic/game/${newGameId}/move`;
            stompClient.subscribe(subscribeTo, this.processLastMoveMessage.bind(this));

            //game status changes
            subscribeTo = `/topic/game/${newGameId}/state`;
            stompClient.subscribe(subscribeTo, this.processGameStateChange.bind(this));

            //when anyone sits down (even you)
            subscribeTo = `/topic/game/${newGameId}/seat`;
            stompClient.subscribe(subscribeTo, this.processGetGameSeat.bind(this));

            let sendTo = `/con4/game/${newGameId}/seat/user/${this.myUserId}`;
            stompClient.send(sendTo, {}, JSON.stringify({
                'gameId': newGameId,
                'userId': this.myUserId
            }));
        }.bind(this));

        //TODO: handle disconnect code
    }

    /**
     * processes incoming websocket messages.
     * @param {*} gameMoveResult JSON of the last move.
     */
    processLastMoveMessage(gameMoveResultJson) {
        let gameMoveResult = JSON.parse(gameMoveResultJson.body);
        let playerNum = gameMoveResult.playerNum;
        let col = gameMoveResult.col;
        //let placedRow = gameMoveResult.placedRow;

        let wasValid = gameMoveResult.wasValid;
        let wasWinning = gameMoveResult.wasWinning;
        let isBoardFull = gameMoveResult.isBoardFull;

        console.log("msg received:" + gameMoveResult);

        if (!wasValid)
            return; //do nothing for now

        if (wasWinning) {
            this.gameState = "END";
            $("#game-text").text(`game over. victory for: ${playerNum}`);
            alert(`game over. victory for: ${playerNum}`);   //TODO: replace
        }
        else {
            if (isBoardFull) {
                alert("tie!");
            }
        }

        this.attemptMoveAndDraw(col);
    }

    /**
     * called when anyone tries to sit down.
     * Go back to lobby on self failure.
     * @param {*} seatTakenMessage 
     */
    processGetGameSeat(seatTakenMessage) {
        let seatMsg = JSON.parse(seatTakenMessage.body);
        let userId = seatMsg.userId;    //some player trying to sit down.
        let playerNum = seatMsg.playerNum;  //their server assigned seat number
        let message = seatMsg.message;

        //is it my seat?
        if (userId == this.myUserId) {
            //didn't get seat
            if (playerNum == -1) {
                console.log(message);
                alert(message); //TODO: ghetto. use fancier div.

                this.disconnectGame();

                theLobby.turnOnLobbyOnly();
                return;
            }
            //got seat
            else {
                this.players.push(userId);

                this.myPlayerNum = playerNum;
                console.log(`got a seat! you are playerNum: ${playerNum}`);
                alert(`got a seat! you are playerNum: ${playerNum}`); //TODO: ghetto. use div
            }

        }
        //other players 
        else {
            //got seat
            if (playerNum != -1) {
                this.players.push(userId);
            }
        }

        //display players
        let playersText = this.players.join(", ");
        $("#game-text").text(playersText);
    }

    /**
     * Server calls this whenever the game changed its state.
     * @param {*} gameStateMessageJson 
     */
    processGameStateChange(gameStateMessageJson) {
        let gameState = JSON.parse(gameStateMessageJson.body);

        switch (gameState) {
            case "PLAY":
                this.gameState = "PLAY";
                break;
            case "END":
                this.gameState = "END";
                break;
            default:
                console.log(`Unknown gamestate: ${gameState}`)
        }

    }

    disconnectGame() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
        }
    }

    /**
     * 
     * @param {String} newGameId 
     */
    setGameId(newGameId) {
        this.gameId = newGameId;
    }

    /**
     * 
     * @param {String} newWebSocket the target websocket url. ex: http:localhost:5000/con4-ws
     */
    setTargetWebSocket(newWebSocket) {
        this.targetWebsocket = newWebSocket;
    }

    /**
     * Erases the board. Sprites and data.
     */
    clearBoard() {
        this.pieceSprites.forEach(sprite => {
            sprite.destroy();
        })
        this.pieceSprites = [];
        this.gameEngine.clearBoard();
    }

    //TODO: refactor - drawing class
    //TODO: refactor - websocket receive class

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

    /**
     * called by ghost Sprite when clicked.
     */
    ghostClicked() {
        let targetCol = this.getData("col");

        /** @type {SceneGameMulti}*/
        let scene = this.scene;

        //TODO: calculate validity locally

        //do nothing on non-PLAY state
        if (scene.gameState != "PLAY")
            return;

        //not our turn!
        if (scene.gameEngine.currentPlayer != scene.myPlayerNum)
            return;

        //TODO: authz token

        let move = {
            "playerNum": scene.myPlayerNum,
            "col": targetCol
        }

        let sendTo = `/con4/game/${scene.gameId}/move`;
        scene.stompClient.send(sendTo, {}, JSON.stringify(move));
    }

    /**
     * Whenever the mouse hovers over a ghost piece.
     * "this" is the button.
     */
    ghostHoverOn() {
        let col = this.getData("col");
        /** @type {SceneGameMulti} */
        let scene = this.scene;

        if (scene.myPlayerNum == 1)
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

        /** @type {SceneGameMulti} */
        let scene = this.scene;

        if (scene.myPlayerNum == 1)
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

        //TODO: adjust sound later. somewhat annoying
        //this.piecePlacedSound.play();

        //END OF TURN
        //change player and change ghost
        if (this.gameEngine.currentPlayer == 1) {
            this.gameEngine.currentPlayer = 2;
        }
        else if (this.gameEngine.currentPlayer == 2) {
            this.gameEngine.currentPlayer = 1;
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
