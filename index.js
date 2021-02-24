// This code creates an HTTP server that listens for requests on the default port, or port 1337 if there is no default. For this guide we are using Express, a popular, lightweight HTTP framework, but you can use any framework you love to build your webhook.

// Imports dependencies and set up http server
'use strict';
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening', process.env.VERIFY_TOKEN))


/// ADD YOUR WEBHOOK ENDPOINT ///

// This code creates a /webhook endpoint that accepts POST requests, checks the request is a webhook event, then parses the message. This endpoint is where the Messenger Platform will send all webhook events.

// Creates the endpoint for our webhook
app.post('/webhook', (req, res)=> {
    let body = req.body;

    // Check this is an event from a page subscrition
    if(body.object === 'page'){
        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry){
            // Gets the message. entry.messaging is an array, but will only contain one message, wso we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
        });

        // Returns a '200 OK' responsse to all requests
        res.status(200).send('EVENT_RECIEVED')
    } else {
        // Returns a '404 not found' if event is not from a page subscription
        res.sendStatus(404);
    }
});



/// ADD WEBHOOK VERIFICATION ///

// This code adds support for the Messenger Platform's webhook verification to your webhook. This is required to ensure your webhook is authentic and working.

// The verification process looks like this:
// - You create a verify token. This is a random string of your choosing, hardcoded into your webhook.
// - You provide your verify token to the Messenger Platform when you subscribe your webhook to receive webhook events for an app.
// - The Messenger Platform sends a GET request to your webhook with the token in the hub.verify parameter of the query string.
// - You verify the token sent matches your verify token, and respond with hub.challenge parameter from the request.
// - The Messenger Platform subscribes your webhook to the app

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string
    console.log('hit', process.env.VERIFY_TOKEN)
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query stirng of the request
    if(mode && token) {

        // Checks the mode and token sent is correct
        if(mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the requests
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge)
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            response.sendStatus(403);
        }
    }
})
