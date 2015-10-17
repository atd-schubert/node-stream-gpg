/*jslint node:true*/
'use strict';

/**
 * Parse a single line of a '--with-colons' gpg response
 *
 * @private
 * @param {String} line - Only one line
 * @returns {GPGKeyElement}
 */
var readColonLine = function (line) {
    var lineArr,
        data = {},
        pkaTranslate,
        stealnessTranslate,
        modelTranslate;

    lineArr = line.split(':');
    pkaTranslate = {
        "1": 'RSA (Encrypt or Sign)',
        "2": 'RSA Encrypt-Only',
        "3": 'RSA Sign-Only',
        "16": 'Elgamal (Encrypt-Only), see [ELGAMAL]',
        "17": 'DSA (Digital Signature Standard)',
        "18": 'Reserved for Elliptic Curve',
        "19": 'Reserved for ECDSA',
        "20": 'Elgamal (Encrypt or Sign)'
    };
    stealnessTranslate = {
        'o': 'old trust-db',
        't': 'wrong trust-model'
    };
    modelTranslate = {

    };
    data.type = lineArr[0];

    if (lineArr[0] === 'tru') {
        data.stealness = stealnessTranslate[lineArr[1]] || lineArr[1];
        data.model = modelTranslate[lineArr[2]] || lineArr[2];

        data.creationDate = new Date(parseInt(lineArr[3], 10) * 1000);
        data.expirationDate = new Date(parseInt(lineArr[4], 10) * 1000);
        data.trustedUsers = {
            marginal: parseInt(lineArr[5], 10),
            complete: parseInt(lineArr[6], 10)
        };
        data.depth = parseInt(lineArr[7], 10);
    } else {
        if (lineArr[2]) {
            data.keyLength = parseInt(lineArr[2], 10);
        }
        if (lineArr[3]) {
            data.publicKeyAlgorithm = pkaTranslate[lineArr[3]] || lineArr[3];
        }
        if (lineArr[4]) {
            data.keyId = lineArr[4];
        }
        if (lineArr[5]) {
            data.creationDate = new Date(parseInt(lineArr[5], 10) * 1000);
        }
        if (lineArr[6]) {
            data.expirationDate = new Date(parseInt(lineArr[6], 10) * 1000);
        }
        if (lineArr[7]) {
            data.uidHash = lineArr[7];
        }
        if (lineArr[8]) {
            data.ownerTrust = lineArr[8].split('=\\x3a=').join(',');
        }
        if (lineArr[9]) {
            data.uid = lineArr[9].split('=\\x3a=').join(',');
        }
        if (lineArr[10]) {
            data.signatureClass = lineArr[10];
        }
        if (lineArr[12]) {
            data.issuer = lineArr[12];
        }
        if (lineArr[13]) {
            data.flag = lineArr[13];
        }
        if (lineArr[14]) {
            data.tokenSerialNumber = lineArr[14];
        }
        if (lineArr[15]) {
            data.hashAlgorithm = lineArr[15];
        }
        if (lineArr[16]) {
            data.curveName = lineArr[16];
        }
    }
    return data;
};

/**
 * Templates the given Object with Arrays
 * @param {{}} obj
 * @returns {{}}
 */
var addKeyProperties = function (obj) {

    obj.crts = obj.certificates = [];
    obj.crss = [];
    obj.subs = obj.subkeys = [];
    obj.ssbs = obj.secretSubkeys = [];
    obj.uids = obj.userIds = [];
    obj.uats = obj.userAttributes = [];
    obj.sigs = obj.signatures = [];
    obj.revs = obj.revokeSignatures = [];
    obj.fpts = obj.fingerprints = [];
    obj.pkds = obj.publicKeyDatas = [];
    obj.grps = obj.keygrips = [];
    obj.rvks = obj.revokationKeys = [];
};

/**
 * Parse a whole response of a '--with-colons' gpg response
 *
 * @param {Buffer|String} data
 * @returns {WebOfTrust}
 */
var parseColonResponse = function (data) {
    var lines,
        doc,
        currentKey,
        i,
        tmp;

    doc = {
        trustInfo: null,
        publicKeys: [],
        secretKeys: []
    };

    lines = data.toString().split(/\r?\n/);

    for (i = 0; i < lines.length; i += 1) {
        if (lines[i].trim() !== '') { // skip empty lines
            tmp = readColonLine(lines[i]);
            if (tmp.type === 'tru') {
                doc.trustInfo = tmp;
            } else if (tmp.type === 'sec') {
                currentKey = tmp;
                addKeyProperties(tmp);
                doc.secretKeys.push(currentKey);
            } else if (tmp.type === 'pub') {
                currentKey = tmp;
                addKeyProperties(tmp);
                doc.publicKeys.push(currentKey);
            } else {
                if (!currentKey) {
                    throw new Error('Property before private or secret key. Wrong structure of response.');
                }
                if (currentKey[tmp.type + 's'] && Array.prototype.isPrototypeOf(currentKey[tmp.type + 's'])) {
                    currentKey[tmp.type + 's'].push(tmp);
                }
            }
        }
    }
    return doc;
};

module.exports = {
    readColonLine: readColonLine,
    addKeyProperties: addKeyProperties,
    parseColonResponse: parseColonResponse
};
