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

//TODO: use some final init'er
var gameInstance = new Phaser.Game(config);
