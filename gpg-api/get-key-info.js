/*jslint node:true*/

'use strict';

var spawn = require('../frameworks/spawn');
var Writable = require('stream').Writable;
var helper = require('./helper/read-colon');

/**
 * Get Key info
 * @returns {stream.writable}
 */
var getKeyInfo  = function getGPGKeyInfo(cb) {
    var cmd = spawn('gpg', ['--with-fingerprint', '--batch', '--with-colons', '--quiet', '--']),
        ws = Writable(),
        response = [];

    ws._write = function (chunk, enc, next) {
        cmd.stdin.write(chunk);
        next();
    };
    ws.end = function () {
        cmd.stdin.end();
    };
    cmd.on('error', function (err) {
        ws.emit('error', err);
    });
    cmd.stdout.on('data', function (data) {
        response.push(data.toString());
    });
    cmd.on('exit', function (code) {
        if (code) {
            return cb(new Error('Fingerprint ended with exit code ' + code));
        }
        ws.emit('exit', code);
        cb(null, helper.parseColonResponse(response.join('')));
    });

    return ws;
};

module.exports = getKeyInfo;
