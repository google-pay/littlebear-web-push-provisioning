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
 * @fileoverview Contains invokeWppFlow to kick off web push provisioning when the
 * Add to Google Pay button is clicked.
 */

 /**
  * Invokes the Google Pay Web Push Provisioning Application, supplying required
  * parameters and callback functions.
  */
function launchGooglePayWebApp() {
    const randomSessionId = Math.random().toString(16).substring(2);
    window.googlepay.openAppWindow({
        'integratorId': 'SANDBOX_TEST_ISSUER',  // Replace with your integrator ID.
        'isTestEnvironment': true,              // Denotes sandbox if true.
        'tokenSetting': 1,                      // Save a token? 1 => Yes, 0 => No.
        'cardSetting': 1,                       // Save an FPAN?
        'clientSessionId': randomSessionId,     // Used here and in the backend call.
        'onReady': function () {
            // If you want to modify the UI while the Google Pay Web Application is open, do so here.
        },
        'onSessionCreated': function (payload) {
            var serverSessionId = payload['serverSessionId'];
            // Your intended tokenSetting and cardSetting values may be overridden
            // in certain situations. For example, if the user doesn't have an
            // Android device that supports tokenized card payments, tokenSetting
            // will be forced to 0.
            //
            // Always check the tokenSetting and cardSetting values in this payload
            // to find out if this has happened.
            var finalTokenSetting = payload['tokenSetting'];
            var finalCardSetting = payload['cardSetting'];
            var publicDeviceId = payload['publicDeviceId'];
            var publicWalletId = payload['publicWalletId'];
            //
            // ******************** IMPORTANT ********************
            // Propagate session info to your backend server here.
            // ***************************************************
            // In this sample, the entire payload is sent to the Little Bear server,
            // which calls GSP's /pushProvisioningNotification endpoint properly.
            // In practice, you will need to send the clientSessionId, serverSessionId,
            // tokenSetting and cardSetting to your server so that it knows what fields
            // to populate when calling /pushProvisioningNotification.
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/pushProvision', /* async= */ true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(payload));
            console.log('onSessionCreated: Sending: ' + JSON.stringify(payload) + ' to server.');
        },
        'onSuccess': function (payload) {
            var tokenResult = payload['tokenResult'];
            var cardResult = payload['cardResult'];
            var debugInfo = payload['debugInfo'];
            console.log('onSuccess: Received payload: ' + JSON.stringify(payload));
            //
            // Handle app success here.
        },
        'onFailure': function (payload) {
            var firstErrorCode = payload['errors'][0]['errorCode'];
            console.log('onFailure: Received payload: ' + JSON.stringify(payload));
            //
            // Handle app failure here.
        },
        'onFinish': function(payload) {
            console.log('onFinish: Received payload: ' + JSON.stringify(payload));
            //
            // Optionally handle the application window being closed after
            // a success or failure method has been displayed.
        },
        'onCancel': function (payload) {
            console.log('onCancel: Received payload: ' + JSON.stringify(payload));
            //
            // Handle app cancellation here.
        },
    });
}