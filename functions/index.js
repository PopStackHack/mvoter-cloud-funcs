const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const deploy = require('./deploy');
const update = require('./update');

exports.deploy = functions.https.onRequest(deploy);
exports.update = functions.https.onRequest(update);
