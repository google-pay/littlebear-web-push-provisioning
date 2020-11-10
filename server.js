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
 * @fileoverview Express web server for Little Bear Web Push Provisioning sample
 * Hosts an HTML page at / that displays the Add to Google Pay button. Ths page
 * must be hosted on a domain allowed by Google.
 *
 * The /echo endpoint accepts POST requests and forwards the request body on to
 * Google Standard Payments' `echo` endpoint.
 *
 * The /pushProvision endpoint accepts POST requests from a frontend client
 * containing the `payload` object provided by Google's Web Push Provisioning integration
 * library in `onSessionCreated()`.
 */

const express = require('express');
const base64url = require('base64url');
const axios = require('axios');
const crypto = require('./crypto.js');
const push_provisioning_utils = require('./push_provisioning_utils.js');
const { v4: uuidv4 } = require('uuid');

const PIAID = 'YOUR_PIAID_HERE';
const HOST = 'billpaynotification.sandbox.googleapis.com';

const ECHO_URL = 'https://' + HOST + '/secure-serving/gsp/v1/echo/' + PIAID;
const PUSH_PROVISION_URL =
    'https://' + HOST + '/secure-serving/gsp/v1/pushProvisioningNotification/' + PIAID;
const AXIOS_CONFIG = {
    headers: { 'Content-Type': 'application/octet-stream' },
};

const app = express();
app.use(express.json());
app.use('/public', express.static(__dirname + '/public'));

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

// Serve the HTML that hosts the Add to Google Pay button and the WPP library
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/form.html');
});

// Accept POST requests to /echo, forwarding the request body to GSP's `echo` endpoint
app.post('/echo', async (req, res) => {
    console.log(req.body);
    const message = buildEchoRequestBody(JSON.stringify(req.body));
    const encrypted = await crypto.encrypt(message);

    try {
        const response =
            await axios.post(ECHO_URL, base64url(encrypted), AXIOS_CONFIG);
        const encryptedMessage = base64url.toBuffer(response.data);
        const decryptedResponse = await crypto.decrypt(encryptedMessage);
        res.status(200);
        res.send(decryptedResponse);
    } catch (error) {
        console.log('Error occurred while attempting to call ' + ECHO_URL + ': ' + error);
        res.status(500);
        res.send(error);
    }
});

// Take a payload, construct request to pushProvisioningNotification endpoint
app.post('/pushProvision', async (req, res) => {
    const serverSessionId = req.body.serverSessionId;
    const clientSessionId = req.body.clientSessionId;
    const tokenSetting = req.body.tokenSetting;
    const cardSetting = req.body.cardSetting;
    const publicWalletId = req.body.publicWalletId;

    let requestTemplate =
        await push_provisioning_utils.getPushProvisioningRequestTemplate();
    requestTemplate.requestHeader.requestId = uuidv4();
    requestTemplate.requestHeader.requestTimestamp = Date.now().toString();
    requestTemplate.pushContext.serverSessionId = serverSessionId;
    requestTemplate.pushContext.clientSessionId = clientSessionId;
    if (tokenSetting === 1) {
        const tokenizableOpaqueAccountCredentialTemplate = await push_provisioning_utils.getTokenizableOpaqueAccountCredentialTemplate(publicWalletId);
        requestTemplate.paymentInstrumentMaterial.push({"tokenizableOpaqueAccountCredential": tokenizableOpaqueAccountCredentialTemplate});
        console.log(tokenizableOpaqueAccountCredentialTemplate);
    }

    const paymentCardTemplate = await push_provisioning_utils.getPaymentCardTemplate();
    requestTemplate.paymentAccount.paymentCard = paymentCardTemplate;
    if (cardSetting === 1) {
        requestTemplate.paymentInstrumentMaterial.push({"paymentCard": paymentCardTemplate});
    }

    console.log(requestTemplate);
    const encrypted = await crypto.encrypt(JSON.stringify(requestTemplate));
    try {
        const response = await axios.post(
            PUSH_PROVISION_URL, base64url(encrypted), AXIOS_CONFIG);
        const encryptedMessage = base64url.toBuffer(response.data);
        const decryptedResponse = await crypto.decrypt(encryptedMessage);
        res.status(200);
        res.send(decryptedResponse);
    } catch (error) {
        console.log('Error occurred while trying to call ' + PUSH_PROVISION_URL + ': ' + error);
        res.status(500);
        res.send(error);
    }
});

/**
 * Builds the unencrypted request body for hitting Google Standard Payments'
 * `echo` endpoint.
 * @param {string} message to be sent in the 'clientMessage' field to GSP
 */
function buildEchoRequestBody(message) {
    const bodyJson = {
        'requestHeader': {
            'protocolVersion': {
                'major': 1,
                'minor': 0,
                'revision': 0,
            },
            'requestId': uuidv4(),
            'requestTimestamp': Date.now().toString(),
        },
        'clientMessage': message,
    };
    return JSON.stringify(bodyJson);
}
