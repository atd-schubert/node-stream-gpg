/*jslint node:true*/

'use strict';

var spawn = require('../frameworks/spawn');
var Writable = require('stream').Writable;

/**
 * Import a key
 * @returns {stream.writable}
 */
var importKey  = function importGPGKey() {
    var cmd = spawn('gpg', ['--import', '--batch', '--']),
        ws = Writable();

    ws._write = function (chunk, enc, next) {
        cmd.stdin.write(chunk);
        next();
    };
    ws.end = function () {
        cmd.stdin.end();
    };
    cmd.on('error', function(err) {
        ws.emit('error', err);
    });
    cmd.on('exit', function (code) {
        ws.emit('exit', code);
    });

    return ws;
};

module.exports = importKey;
