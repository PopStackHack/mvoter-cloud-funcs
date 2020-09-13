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
  const foundVersionCodeIndex = resultEntries.findIndex(([key]) => key === versionCode);

  if (foundVersionCodeIndex > -1) { // version code exists
    // Compare with latest update
    const latestUpdate = resultEntries[resultEntries.length - 1];
    const containsForceUpdate = resultEntries
      .slice(foundVersionCodeIndex, resultEntries.length)
      .findIndex(([, info]) => info.is_force_update === 1) > -1;

      if (containsForceUpdate) {
        latestUpdate[1].should_update = true;
      } else {
        latestUpdate[1].should_update = false;
      }

    latestUpdate[1].is_force_update = latestUpdate[1].is_force_update === 1 ? true : false;
    return latestUpdate[1];
  } else {
    throw new Error('Version code not found.');
  }
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
