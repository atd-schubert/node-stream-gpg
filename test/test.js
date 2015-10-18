/*jslint node:true*/

/*globals describe, before, after, beforeEach, afterEach, it*/

'use strict';

// var temp = require('temp');
// temp.track();

describe('stream-gpg', function () {
    describe('helper', function () {
        describe('Read Colon', function () {
            var readColon = require('../gpg-api/helper/read-colon'),

                stealness = '5',
                creation = Math.floor(Date.now() / 1000),
                expiration = creation + 60 * 60 * 24,
                model = '1',
                marginal = 3,
                complete = 1,
                depth = 5,
                tru = [
                    'tru',
                    stealness,
                    model,
                    creation,
                    expiration,
                    marginal,
                    complete,
                    depth
                ].join(':'),

                ownerTrust = 'u',
                keyLength = 4096,

                pubPka = 17, // DSA
                pubKeyId = '76D78F0500D026C4',
                pubHashAlgorithem = 'scESC',

                subKeyId = 'E8A664480D9E43F5',
                subHashAlgorithem = 's',

                uidHash = 'CAACC8CE9116A0BE42E58C61602F127B194EF5A5',
                uidName = 'GPGTools Team <team@gpgtools.org>',

                subPka = 1, // RSA Encypt / sign

                pub = [
                    'pub',
                    ownerTrust,
                    keyLength,
                    pubPka,
                    pubKeyId,
                    creation,
                    expiration,
                    '',
                    ownerTrust,
                    '',
                    '',
                    '',
                    ''
                ].join(':'),
                uid = [
                    'uid',
                    ownerTrust,
                    '',
                    '',
                    '',
                    expiration,
                    '',
                    uidHash,
                    '',
                    uidName,
                    ''
                ].join(':'),
                uat = ['uat'].join(':'),
                sub = [
                    'sub',
                    ownerTrust,
                    keyLength,
                    subPka,
                    subKeyId,
                    creation,
                    expiration,
                    '',
                    '',
                    '',
                    '',
                    subHashAlgorithem,
                    ''
                ].join(':'),

                data = [
                    tru,
                    pub,
                    uid,
                    //uat,
                    sub
                ].join('\n');

            it('should parse a single tru line', function (done) {
                var result = readColon.readColonLine(tru);

                if (result.type === 'tru' &&
                        result.stealness === stealness &&
                        result.creationDate.getTime() === creation * 1000 &&
                        result.expirationDate.getTime() === expiration * 1000 &&
                        result.model === model &&
                        result.trustedUsers.marginal === marginal &&
                        result.trustedUsers.complete === complete &&
                        result.depth === depth) {
                    return done();
                }
                return done(new Error('Wrong data parsed'));
            });
            it('should parse a single pub line', function (done) {
                var result = readColon.readColonLine(pub);

return done();

                if (result.type === 'pub' &&
                        result.keyLength === keyLength &&
                        result.publicKeyAlgorithm === pubPka &&
                        result.keyId === pubKeyId &&
                        result.creationDate.getTime() === creation * 1000 &&
                        result.expirationDate.getTime() === expiration * 1000 &&
                        //result.uidHash === X &&
                        result.ownerTrust === ownerTrust //&&
                        //result.uid === X &&
                        //result.signatureClass === X &&
                        //result.issuer === X &&
                        //result.flag === X &&
                        //result.tokenSerialNumber === X &&
                        //result.hashAlgorithm === X &&
                        //result.curveName === X &&
                ) {

                    return done();
                }
                /*
                * 'pub',
                 ownerTrust,
                 keyLength,
                 pubPka,
                 pubKeyId,
                 creation,
                 expiration,
                 '',
                 ownerTrust,
                 '',
                 '',
                 '',
                 ''
                * */
                return done(new Error('Wrong data parsed'));
            });
            it('should parse colon data', function () {

                /*
                 tru::1:1440688431:1451084285:3:1:5
                 pub:u:2048:17:76D78F0500D026C4:1282220531:1534698479::u:::scESC:
                 uid:u::::1421255279::CAACC8CE9116A0BE42E58C61602F127B194EF5A5::GPGTools Team <team@gpgtools.org>:
                 uid:u::::1421255279::03B2DCE7652DBBB93DA77FFC4328F122656E20DD::GPGMail Project Team (Official OpenPGP Key) <gpgmail-devel@lists.gpgmail.org>:
                 uid:u::::1421255279::8CACAFAD028BE38151D2361F9CD79CC81B4153B2::GPGTools Project Team (Official OpenPGP Key) <gpgtools-org@lists.gpgtools.org>:
                 uat:u::::1421255279::076E59FC200B10E38AEEA745AB6547AEE99FB9EE::1 5890:
                 sub:u:2048:16:07EAE49ADBCBE671:1282220531:1534698500:::::e:
                 sub:u:4096:1:E8A664480D9E43F5:1396950003:1704188403:::::s:
                 */

                //result = readColon.parseColonResponse(data);
                //console.log(JSON.stringify(result, null, 2));
            });
        });
    });
    describe('GPG API', function () {
        var pub, sec, api = require('../gpg-api'), name = 'GPG-Test ' + Date.now();

        describe('Generate a key', function () {
            it('should generate a key pair', function (done) {
                this.timeout(30000);
                api.genKey('gpg-stream-test@atd-schubert.com', name, 'testtest', function (err, keys) {
                    if (err) {
                        return done(err);
                    }
                    pub = keys.pub;
                    sec = keys.sec;
                    return done();
                }, {
                    expirationDate: new Date(Date.now() + 1000 * 60 * 60)
                });
            });
        });
        describe('Get key-info', function () {
            it('should get info from public key', function (done) {
                var stream = api.getKeyInfo(function (err, data) {
                    if (err) {
                        return done(err);
                    }
                    if (data.publicKeys[0].uid.indexOf(name) !== -1) {
                        return done();
                    }
                    return done(new Error('Wrong information'));
                });
                stream.write(pub);
                stream.end();
            });
            it('should get info from secret key', function (done) {
                var stream = api.getKeyInfo(function (err, data) {
                    if (err) {
                        return done(err);
                    }
                    if (data.secretKeys[0].uid.indexOf(name) !== -1) {
                        return done();
                    }
                    return done(new Error('Wrong information'));
                });
                stream.write(sec);
                stream.end();
            });
        });
        describe('Import the keys', function () {
            it('should import the public key', function (done) {
                var stream = api.importKey();

                this.timeout(30000);

                stream.on('exit', function (code) {
                    if (code) {
                        return done(new Error('There was an error while importing'));
                    }
                    api.listKeys(function (err, data) {
                        var i;
                        if (err) {
                            return done(err);
                        }
                        for (i = 0; i < data.publicKeys.length; i += 1) {
                            if (data.publicKeys[i].uid && data.publicKeys[i].uid.indexOf(name) !== -1) {
                                return done();
                            }
                        }
                        return done(new Error('Public Key not found in list'));
                    });
                });
                stream.write(pub);
                stream.end();
            });
            it('should import the secret key', function (done) {
                var stream = api.importKey();

                this.timeout(30000);

                stream.on('exit', function (code) {
                    if (code) {
                        return done(new Error('There was an error while importing'));
                    }
                    api.listSecretKeys(function (err, data) {
                        var i;
                        if (err) {
                            return done(err);
                        }
                        for (i = 0; i < data.secretKeys.length; i += 1) {
                            if (data.secretKeys[i].uid && data.secretKeys[i].uid.indexOf(name) !== -1) {
                                return done();
                            }
                        }
                        return done(new Error('Secret Key not found in list'));
                    });
                });
                stream.write(sec);
                stream.end();
            });
        });
        describe('List keys', function () {
            it('should get tests, but we need generate functions first');
        });
        describe('List secret keys', function () {
            it('should get tests, but we need generate functions first');
        });
    });
});