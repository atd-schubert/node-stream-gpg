/*jslint node:true*/

'use strict';

// For example: x=require('./'); x.genKey('ich@was.de', 'Test', 'testtest', function(err, keys){keys.pub.pipe(fs.createWriteStream('test.pub'))});

var spawn = require('../frameworks/spawn');
var exec = require('../frameworks/exec');
var temp = require('temp');
var fs = require('../frameworks/fs');
var async = require('async');

/**
 *
 * @param {string} email - Email for the new key pair
 * @param {string} name - Name for the new key pair
 * @param {string} passwd - Password for the new key pair
 * @param {genKey~resultCallback} cb - Callback with generated key pairs
 * @param {{}} [opts] - Optional settings
 * @param {string} [opts.keyType="RSA"] - Type of key algorithm
 * @param {number} [opts.keyLength=4096] - Length of the key
 * @param {string} [opts.subKeyType="RSA"] - Type of sub key algorithm
 * @param {number} [opts.subKeyLength=4096] - Length of the sub key
 * @param {string} [opts.comment="Created with node.js - stream-gpg"] - Comment on the key
 * @param {Date|Number} [opts.expireDate] - Expiration date or '0' for never expiring. Default 3 years from now.
 * @param {Date} [opts.creationDate=new Date()] - Creation date. Defaults to now.
 */
var genKey  = function generateGPGKey(email, name, passwd, cb, opts) { // should work fine
    opts = opts || {};
    opts.keyType = opts.keyType || 'RSA';
    opts.keyLength = opts.keyLength || 4096;
    opts.subKeyType = opts.subKeyType || 'RSA';
    opts.subKeyLength = opts.subKeyLength || 4096;
    opts.comment = opts.comment || 'Created with node.js - stream-gpg';
    opts.expireDate = opts.expireDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 3); // three years
    opts.creationDate = opts.creationDate || new Date();

    if (Date.prototype.isPrototypeOf(opts.expireDate)) {
        opts.expireDate = opts.expireDate.toISOString().split('T')[0];
    }

    var pubringTemp = temp.path({suffix: '.pub'}),
        secringTemp = temp.path({suffix: '.sec'}),
        toWrite = [
            '%echo Generating a default key',
            'Key-Type: ' + opts.keyType,
            'Subkey-Type: ' + opts.subKeyType,
            'Key-Length: ' + opts.keyLength,
            'Subkey-Length: ' + opts.subKeyLength,
            'Name-Real: ' + name,
            'Name-Comment: ' + opts.comment,
            'Name-Email: ' + email,
            'Expire-Date: ' + opts.expireDate,
            'Creation-Date: ' + opts.creationDate.toISOString().split('T')[0],
            'Passphrase: ' + passwd,
            '%no-ask-passphrase',
            '%echo Setting all data now create rings',
            '%pubring ' + pubringTemp,
            '%secring ' + secringTemp,
            '%echo Now committing',
            ' # Do a commit here, so that we can later print "done" :-)',
            '%commit',
            '%echo done'
        ],
        cmd = spawn('gpg', ['--gen-key', '--batch']),
        ready,
        entropy = function () {
            if (ready) {
                return;
            }
            exec('find / > /dev/null', function () {
                entropy();
            });
        };

    cmd.on('exit', function (code) {
        var asyncArr;

        //clearInterval(interval);
        ready = true;

        if (code) {
            return cb(new Error('gpg was exiting with exit code: ' + code));
        }
        asyncArr = [
            function (cb) {
                fs.readFile(secringTemp, function (err, data) {
                    if (err) {
                        return cb(err);
                    }
                    fs.unlink(secringTemp, function (err) {
                        if (err) {
                            return cb(err);
                        }
                        return cb(null, data);
                    });
                });
            },
            function (cb) {
                fs.readFile(pubringTemp, function (err, data) {
                    if (err) {
                        return cb(err);
                    }
                    fs.unlink(pubringTemp, function (err) {
                        if (err) {
                            return cb(err);
                        }
                        return cb(null, data);
                    });
                });
            }
        ];

        async.parallel(asyncArr, function (err, rings) {
            if (err) {
                return cb(err);
            }
            /**
             * @callback genKey~resultCallback
             * @param {Error|null} error - Error if there is one
             * @param {{}} keys - Key pairs
             * @param {Buffer} keys.pub - Public key
             * @param {Buffer} keys.sec - Secret key
             */
            return cb(null, {sec: rings[0], pub: rings[1]});
        });
    });
    cmd.stdin.write(toWrite.join('\r\n'));
    cmd.stdin.end();
};

module.exports = genKey;
