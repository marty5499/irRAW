var webduino = require("webduino-js");
var led;
var board = new webduino.WebArduino('GLK7');
board.on("ready", function(board) {
    led = new webduino.module.Led(board, board.getDigitalPin(13));
    led.blink(100);
});