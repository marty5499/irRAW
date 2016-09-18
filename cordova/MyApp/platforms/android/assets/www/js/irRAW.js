+(function(factory) {
    factory(window);
}(function(scope) {
    'use strict';

    var self;
    var proto;
    var sendLen = 32;
    var lastSendIR = false;
    
    function log(obj) {
        if (self.isDebug) {
            console.log(obj);
        }
    }

    function IR(board, irSend, irRecv) {
        this._board = board;
        this.pinSendIR = irSend;
        this.pinRecvIR = irRecv;
        this.isDebug = true;
        self = this;
        board.on(webduino.BoardEvent.SYSEX_MESSAGE, function(event) {
            var m = event.message;
            //send IR data to Board
            if (m[0] == 0x04 && m[1] == 0x09 && m[2] == 0x0B) {
                log("send IR data to Board callback");
                if (lastSendIR) {
                    //store OK
                    lastSendIR = false;
                    log("store OK");
                    log("send pin:", self.pinSendIR);
                    board.send([0xf0, 0x04, 0x09, 0x0C, self.pinSendIR, 0xF7]);
                }
            }
            //trigger IR send
            else if (m[0] == 0x04 && m[1] == 0x09 && m[2] == 0x0C) {
                log("trigger IR send callback...");
                self.irSendCallback();
            }
            //record IR data
            else if (m[0] == 0x04 && m[1] == 0x09 && m[2] == 0x0D) {
                log("record IR callback...");
                var strInfo = '';
                for (var i = 3; i < m.length; i++) {
                    strInfo += String.fromCharCode(m[i]);
                }
                self.irRecvCallback(strInfo.substring(4));
            } else {
                log(event);
            }
        });
    }

    function send(startPos, data) {
        var CMD = [0xf0, 0x04, 0x09, 0x0A];
        var raw = [];
        raw = raw.concat(CMD);
        var n = '0000' + startPos.toString(16);
        n = n.substring(n.length - 4);
        for (var i = 0; i < 4; i++) {
            raw.push(n.charCodeAt(i));
        }
        raw.push(0xf7);
        // send Data //  
        CMD = [0xf0, 0x04, 0x09, 0x0B];
        raw = raw.concat(CMD);
        for (i = 0; i < data.length; i++) {
            raw.push(data.charCodeAt(i));
        }
        raw.push(0xf7);
        board.send(raw);
    }

    function sendIRCmd(cmd, len) {
        for (var i = 0; i < cmd.length; i = i + len) {
            var data = cmd.substring(i, i + len);
            send(i / 8, data);
        }
        lastSendIR = true;
    }

    IR.prototype = proto = Object.create(Object.prototype, {
        constructor: {
            value: IR
        },
        intensity: {
            get: function() {
                return "";
            },
            set: function(val) {
                console.log("set...");
            }
        }
    });

    proto.recv = function(callback) {
        self.irRecvCallback = callback;
        board.send([0xF0, 0x04, 0x09, 0x0D, self.pinRecvIR, 0xF7]);
    };

    proto.send = function(data, callback) {
        sendIRCmd(data, sendLen);
        self.irSendCallback = callback;
    }

    proto.debug = function(val) {
        if (typeof val == 'boolean') {
            self.isDebug = val;
        }
    }

    scope.IR = IR;
}));