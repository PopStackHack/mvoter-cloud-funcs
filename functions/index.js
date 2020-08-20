const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const deploy = require('./deploy');

exports.deploy = functions.https.onRequest(deploy);
