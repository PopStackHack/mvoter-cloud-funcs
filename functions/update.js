const admin = require('firebase-admin');
const express = require('express');
const serviceAccount = require('./serviceAccount.json');
const { firebaseConfig } = require('firebase-functions');
const { version } = require('moment');

const router = express.Router();
const databaseURL = firebaseConfig().databaseURL;
const db = admin.database();

function getLatestUpdate(versionCode, result) {
  // Check for version ranges in which the version code falls upon
  const resultEntries = Object.entries(result);
  const foundVersionCodeIndex = resultEntries.findIndex(([key]) => Number(key) > Number(versionCode));
  const latestUpdate = resultEntries[resultEntries.length - 1];

  if (foundVersionCodeIndex > -1) { // version code exists
    // Compare with latest update
    const containsForceUpdateBetweenRange = resultEntries
      .slice(foundVersionCodeIndex, resultEntries.length)
      .findIndex(([, info]) => info.is_force_update === 1) > -1;

      if (containsForceUpdateBetweenRange) {
        latestUpdate[1].is_force_update = true;
      } else {
        latestUpdate[1].is_force_update = false;
      }
  } else {
    latestUpdate[1].is_force_update = latestUpdate[1].is_force_update === 0 ? false : true;
  }

  latestUpdate[1].link = 'https://mvoterapp.com/apk';
  latestUpdate[1].playstore_link = 'https://mvoterapp.com/android';

  return latestUpdate[1];
}

router.post('/android', async (req, res) => {
  try {
    const {
      version_code,
    } = req.body;

    const snapshot = await db.ref(`android_version`).orderByChild('timestamp').once('value');
    const result = snapshot.val();

    const latestUpdate = getLatestUpdate(version_code, result);

    return res.send({
      success: true,
      data: latestUpdate,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({
        success: false,
      });
  }
});

router.post('/ios', async (req, res) => {
  try {
    const {
      version_code,
    } = req.body;

    const snapshot = await db.ref(`ios_version`).orderByChild('timestamp').once('value');
    const result = snapshot.val();

    const latestUpdate = getLatestUpdate(version_code, result);

    return res.send({
      success: true,
      data: latestUpdate,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({
        success: false,
      });
  }
});

module.exports = router;
