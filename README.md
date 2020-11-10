# Little Bear Web Push Provisioning Node.js Sample

This project demonstrates how to use the
[Google Pay Web Push Provisioning API](https://developers.google.com/pay/issuers/apis/push-provisioning/web).


## Prerequisites
* [NodeJS](https://nodejs.org/en/download/)
* [Google Cloud SDK](https://cloud.google.com/sdk/) (aka gcloud) if you wish to test on a Google App Engine instance
* A front end gateway to handle TLS termination (either Google App Engine or your own solution)
* Add the [integration.min.js](https://developers.google.com/pay/issuers/apis/push-provisioning/web/downloads/integration.min.js) file
provided on the [Google Pay Web Push Provisioning](https://developers.google.com/pay/issuers/apis/push-provisioning/web) developer site
to the `public/` folder.

## Running the server
1. In the project directory, run `npm install` to install dependencies.
2. Set up your keys in the project directory as follows. Add your ASCII armored PGP keys to the top level of the project directory in files named private.key and public.key. Then, add your private key passphrase to passphrase.txt.
3. Set the PIAID constant in server.js. Google will provide you with your PIAID during the PGP key exchange process.
4. In the project directory, run one of the following commands:

  * `node server.js` to run the code locally
  * `gcloud app deploy` run it on a pre-configured AppEngine instance