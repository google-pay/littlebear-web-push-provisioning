/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Utils for encrypting and decrypting using openpgp
 *
 * You can implement your own logic to fetch keys and replace the references
 * to keys.js, or swap out the encrypt and decrypt methods for your own
 * implementations.
 */

const openpgp = require('openpgp');
const keys = require('./keys.js');

var methods = {
    encrypt: async function(message) {
        const privateKeyArmored = await keys.getPrivateKey();
        const { keys: [privateKey] } = await openpgp.key.readArmored(privateKeyArmored);
        const passPhrase = await keys.getPassPhrase();
        await privateKey.decrypt(passPhrase);

        const publicKeyArmored = await keys.getPublicKey();
        const publicKeys = (await openpgp.key.readArmored(publicKeyArmored)).keys;

        const { data: encrypted } = await openpgp.encrypt({
            message: openpgp.message.fromText(message),
            publicKeys: publicKeys,
            privateKeys: [privateKey]
        });
        return encrypted;
    },

    decrypt: async function(encrypted_message) {
        const privateKeyArmored = await keys.getPrivateKey();
        const { keys: [privateKey] } = await openpgp.key.readArmored(privateKeyArmored);
        const passPhrase = await keys.getPassPhrase();
        await privateKey.decrypt(passPhrase);

        const publicKeyArmored = await keys.getPublicKey();
        const publicKeys = (await openpgp.key.readArmored(publicKeyArmored)).keys;

        openpgp.config.ignore_mdc_error = true;
        const { data: decrypted_response } = await openpgp.decrypt({
            message: await openpgp.message.read(encrypted_message),
            publicKeys,
            privateKeys: [privateKey] // for decryption
        });
        console.log('Decrypted Body', decrypted_response);
        return decrypted_response;
    }
};

module.exports = methods;