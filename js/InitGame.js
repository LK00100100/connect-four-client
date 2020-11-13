//this file starts the game.

var sceneGame = new SceneGame();

let config = {
    type: Phaser.AUTO,
    width: 600,
    height: 480,
    scene: [sceneGame]
};

var gameInstance = new Phaser.Game(config);
