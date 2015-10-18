/*jslint node: true*/

'use strict';

module.exports = {
    genKey: require('./gen-key'),
    listKeys: require('./list-keys'),
    listSecretKeys: require('./list-secret-keys')
};

// jsdoc definitions
/**
 * @name GPGKeyElement
 * @type {object}
 * @property {String} type
 * @property {String} stealness
 * @property {String} model
 * @property {{}} trustedUsers
 * @property {Number} trustedUsers.marginal
 * @property {Number} trustedUsers.complete
 * @property {Number} depth
 * @property {number} keyLength
 * @property {string} publicKeyAlgorithm
 * @property {string} keyId
 * @property {Date} creationDate
 * @property {Date} expirationDate
 * @property {string} uidHash
 * @property {string} ownerTrust
 * @property {string} uid
 * @property {string} signatureClass
 * @property {string} issuer
 * @property {String} flag
 * @property {String} tokenSerialNumber
 * @property {String} hashAlgorithm
 * @property {String} curveName
 */


/**
 * @name GPGKey
 * @type {object}
 * @property {number} keyLength
 * @property {string} publicKeyAlgorithm
 * @property {string} keyId
 * @property {Date} creationDate
 * @property {Date} expirationDate
 * @property {string} uidHash
 * @property {string} ownerTrust
 * @property {string} uid
 * @property {string} signatureClass
 * @property {string} issuer
 * @property {GPGKeyElement[]} crts - Certificates (alias for certificates)
 * @property {GPGKeyElement[]} certificates - Certificates (alias for crts)
 * @property {GPGKeyElement[]} crss
 * @property {GPGKeyElement[]} subs
 * @property {GPGKeyElement[]} subkeys
 * @property {GPGKeyElement[]} secs
 * @property {GPGKeyElement[]} secretKeys
 * @property {GPGKeyElement[]} ssbs
 * @property {GPGKeyElement[]} secretSubkeys
 * @property {GPGKeyElement[]} uids
 * @property {GPGKeyElement[]} userIds
 * @property {GPGKeyElement[]} uats
 * @property {GPGKeyElement[]} userAttributes
 * @property {GPGKeyElement[]} sigs
 * @property {GPGKeyElement[]} signatures
 * @property {GPGKeyElement[]} revs
 * @property {GPGKeyElement[]} revokeSignatures
 * @property {GPGKeyElement[]} fpts
 * @property {GPGKeyElement[]} fingerprints
 * @property {GPGKeyElement[]} pkds
 * @property {GPGKeyElement[]} publicKeyDatas
 * @property {GPGKeyElement[]} grps
 * @property {GPGKeyElement[]} keygrips
 */

/**
 * @name WebOfTrust
 * @type {{keys: GPGKey[], trustInfo: {creationDate: Date, depth: Number, expirationDate: Date, model: String, trustedUsers: {complete: Number, marginal: Number}}}}
 * @property {GPGKey[]} publicKeys - Public keys registered with local gpg
 * @property {GPGKey[]} secretKeys - Secret keys registered with local gpg
 * @property {object} trustInfo - Information about your local web of trust
 * @property {Date} trustInfo.creationDate - Date of creation
 * @property {number} trustInfo.depth
 * @property {Date} trustInfo.expirationDate - Date of expiration
 * @property {string} trustInfo.model - Kind of web of trust (classic, signature)
 * @property {object} trustInfo.trustedUsers
 * @property {number} trustInfo.trustedUsers.complete - Number of complete trusted users
 * @property {number} trustInfo.trustedUsers.marginal - Number of marginal trusted users
 */
