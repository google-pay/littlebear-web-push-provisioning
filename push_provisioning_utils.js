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
 * @fileoverview Utilities for getting the request templates used in generating
 * requests to Google Standard Payments' /pushProvisioningNotification endpoint.
 *
 * Modify the referenced json files to hard-code your own sandbox payment
 * credentials, or modify the code to retrieve them from somewhere else.
 */

const fs = require('fs');

var methods = {

    /**
     * Provides a skeleton of the pushProvisioningNotification request body that
     * needs card details and wallet information to be filled in by the calling code.
     */
    getPushProvisioningRequestTemplate: async function() {
        let rawData = fs.readFileSync('push_provisioning_notification.json');
        return JSON.parse(rawData);
    },

    /**
     * Provides a skeleton of the paymentCard object needed for the
     * pushProvisioningNotification request. You may provide test card details
     * in the payment_card.json file, or populate it programmatically.
     */
    getPaymentCardTemplate: async function() {
        let rawData = fs.readFileSync('payment_card.json');
        return JSON.parse(rawData);
    },

    /**
     * Provides a skeleton of the tokenizableOpaqueAccountCredential object needed
     * for the pushProvisioningNotification request. You may provide an OPC in
     * tokenizable_opaque_account_credential.json for testing, or populate it
     * programmatically.
     * @param {string} publicWalletId - Identifies the wallet to receive the token.
     */
    getTokenizableOpaqueAccountCredentialTemplate: async function(publicWalletId) {
        let rawData = fs.readFileSync('tokenizable_opaque_account_credential.json');
        let json = JSON.parse(rawData);
        json.publicWalletId = publicWalletId;
        return json;
    }
};

module.exports = methods;