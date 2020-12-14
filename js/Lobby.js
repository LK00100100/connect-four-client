let hostUrl = "http://localhost:5000";

//todo: error handling for http call
$("#btn-refresh").on("click", function () {
    getGamesList();
})

//todo: error handling for http call
$("#btn-create-game").on("click", function () {
    let targetUrl = hostUrl + "/game";

    $.post(targetUrl, createNewGame);
})

function getGamesList() {
    let targetUrl = hostUrl + "/game/list";
    $.get(targetUrl, displayGamesList);
}

function showGameCanvas(){
    $("#game-canvas canvas").css("display", "block");
    $("game-canvas").show();
}

/**
 * clear and display the games that the server has.
 * @param {Array<String>} gamesList list of ids
 */
function displayGamesList(gamesList) {
    //clear html list 
    let $gamesList = $("#games-list");
    $gamesList.html("");

    //load into html list
    gamesList.forEach(gameId => {
        let listItem = createGameListItem(gameId);

        $gamesList.append(listItem);
    });

    console.log("refresh complete.");
}

/**
 * create a list item for the games-list
 * @param {String} gameId 
 */
function createGameListItem(gameId){
    let buttonItem = $("<button>");
    buttonItem.text("join game");

    buttonItem.on("click", function(){
        joinGame(gameId);
    });

    let listItem = $("<li>").text("gameId: " + gameId);
    listItem.append(buttonItem);

    return listItem;
}

function joinGame(gameId){
    console.log(`joining: ${gameId}`);

    turnOffLobbyTurnOnCanvas(gameId);
}

/**
* create a new game. then redirect to it if successfully created.
* @param {Array<String>} newGameId the newly create game's instance id
*/
function createNewGame(newGameId) {
    console.log("game was created.");

    turnOffLobbyTurnOnCanvas(newGameId);
}

/**
 * 
 * @param {String} newGameId the game id to join
 */
function turnOffLobbyTurnOnCanvas(newGameId){
    $("#lobby").hide();

    console.log("turning on canvas.");
    gameInstance.scene.scenes[0].setGameId(newGameId);
    showGameCanvas();
}

$(function () {
    //there's only one canvas. it's the phaser canvas
    $("game-canvas").hide();

    getGamesList();
});
