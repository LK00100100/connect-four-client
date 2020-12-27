
/**
 * Contains game Lobby logic
 */
class Lobby {

    constructor() {

        this.initButtons();
        this.con4ServerUrl = "http://localhost:5000";

        this.gameInstance;
    }

    initButtons() {

        //todo: error handling for http call
        $("#btn-refresh").on("click", function () {
            this.getGamesList();
        }.bind(this))

        //todo: error handling for http call
        $("#btn-create-game").on("click", function () {
            let targetUrl = this.con4ServerUrl + "/game";

            $.post(targetUrl, this.createNewGame.bind(this));
        }.bind(this))

        $("#btn-lobby").on("click", function () {
            this.turnOnLobbyOnly();
        }.bind(this))
    }

    getGamesList() {
        let targetUrl = this.con4ServerUrl + "/game/list";
        $.get(targetUrl, this.displayGamesList.bind(this));
    }

    showGameCanvas() {
        $("#game-canvas").show();
        $("#game-canvas canvas").css("display", "block");
    }

    hideGameCanvas() {
        $("#game-canvas").hide();
        $("#game-canvas canvas").css("display", "none");
    }

    /**
     * clear and display the games that the server has.
     * @param {Array<String>} gamesList list of ids
     */
    displayGamesList(gamesList) {
        //clear html list 
        let $gamesList = $("#games-list");
        $gamesList.html("");

        //load into html list
        gamesList.forEach(gameId => {
            let listItem = this.createGameListItem(gameId);

            $gamesList.append(listItem);
        });

        //no games found
        if (gamesList.length == 0) {
            let listItem = $("<li>").text("no games found!");
            $gamesList.append(listItem)
        }

        console.log("refresh complete.");
    }

    /**
     * create a list item for the games-list
     * @param {String} gameId 
     */
    createGameListItem(gameId) {
        let buttonItem = $("<button>");
        buttonItem.text("join game");

        buttonItem.on("click", function () {
            this.joinGame(gameId);
        }.bind(this));

        let listItem = $("<li>").text("gameId: " + gameId);
        listItem.append(buttonItem);

        return listItem;
    }

    joinGame(gameId) {
        console.log(`joining: ${gameId}`);

        this.turnOnGameCanvasOnly(gameId);
    }

    /**
    * create a new game. then redirect to it if successfully created.
    * @param {Array<String>} newGameId the newly create game's instance id
    */
    createNewGame(newGameId) {
        console.log("game was created.");

        this.turnOnGameCanvasOnly(newGameId);
    }

    /**
     * 
     * @param {String} newGameId the game id to join
     */
    turnOnGameCanvasOnly(newGameId) {
        $("#lobby").hide();

        console.log("turning on canvas.");
        let gameScene = gameInstance.scene.scenes[0];
        gameScene.connectToWebSocket(newGameId);

        this.showGameCanvas();
    }

    /**
     * 
     * @param {String} newGameId the game id to join
     */
    turnOnLobbyOnly(newGameId) {
        $("#lobby").show();

        console.log("turning off canvas.");
        let sceneGameMulti = gameInstance.scene.scenes[0];
        sceneGameMulti.disconnectGame();

        this.hideGameCanvas();
    }

}

var theLobby = new Lobby();

$(function () {
    //there's only one canvas. it's the phaser canvas
    $("game-canvas").hide();

    theLobby.getGamesList();
});

//TODO: make a load screen
