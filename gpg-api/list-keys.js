/*jslint node:true*/

'use strict';

var spawn = require('../frameworks/spawn');

var helper = require('./helper/read-colon');

/**
 * Get a list of all knows keys in gpg subsytem
 * @param {listKeys~resultCallback} cb
 * @exports stream-gpg.list-keys
 * @exports stream-gpg.listKeys
 * @exports stream-gpg.k
 * @todo outputs ownertrust correctly
 */
var listKeys  = function listKeys(cb) {
    /**
     * @type {ChildProcess}
     */
    var cmd,
        /**
         * Concat error messages
         * @type {string[]}
         */
        error = [],
        /**
         * Concat data response messages
         * @type {string[]}
         */
        response = [];

    cmd = spawn('gpg', ['--no-verbose', '--batch', '--quiet', '--with-colons', '-k']);
    cmd.stdout.on('data', function (data) {
        response.push(data.toString());
    });
    cmd.stderr.on('data', function (data) {
        error.push(data.toString());
    });
    cmd.on('exit', function (code) {
        if (code !== 0) {
            return cb(error.join(''));
        }

        /**
         * @callback listKeys~resultCallback
         * @param {Error|null} error - Error if there is one
         * @param {WebOfTrust} webOfTrust - The webOfTrust with secret keys
         */
        return cb(null, helper.parseColonResponse(response.join('')));
    });
};

module.exports = listKeys;
