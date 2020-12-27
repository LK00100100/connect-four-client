//this file starts the game. load this js file last

let config = {
    type: Phaser.AUTO,
    width: 600,
    height: 480,
    audio: {
        disableWebAudio: true
    },
    scene: [SceneGameMulti],
    parent: "game-canvas"
};

var theLobby;

//last thing to do: on load up
$(function () {

    var gameInstance = new Phaser.Game(config);

    theLobby = new Lobby();
    theLobby.gameInstance = gameInstance;

    //there's only one canvas. it's the phaser canvas
    $("#game-canvas").hide();

    theLobby.getGamesList();
});

//TODO: make a load screen
