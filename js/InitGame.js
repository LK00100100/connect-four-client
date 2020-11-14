//this file starts the game.


let config = {
    type: Phaser.AUTO,
    width: 600,
    height: 480,
    audio: {
        disableWebAudio: true
    },
    scene: [SceneGame]
};

var gameInstance = new Phaser.Game(config);
