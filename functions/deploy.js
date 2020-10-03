const admin = require('firebase-admin');
const moment = require('moment');
const express = require('express');
const path = require('path');
const os = require('os');
const fs = require('fs');
const Busboy = require('busboy');
const serviceAccount = require('./serviceAccount.json');
const keys = require('./keys.json');
const { firebaseConfig } = require('firebase-functions');
const router = express.Router();

const databaseURL = firebaseConfig().databaseURL;
const storageBucket = firebaseConfig().storageBucket;

const storage = admin.storage().bucket(storageBucket);
const db = admin.database();
const androidRef = db.ref('android_version');
const iosRef = db.ref('ios_version');
const hash = keys.hash;

const uploadFile = (req, res, next) => {
  // Store APK in Firebase Storage
  // Handle GCF multipart with Busboy
  // Already tested with multer but to no avail
  // https://cloud.google.com/functions/docs/writing/http#multipart_data
  const busboy = new Busboy({ headers: req.headers });
  const tmpdir = os.tmpdir();

  const fields = {};
  const uploads = {};

  busboy.on('field', (fieldname, val) => {
    fields[fieldname] = val;
  });

  const fileWrites = [];

  busboy.on('file', (fieldname, file, filename) => {
    const filepath = path.join(tmpdir, filename);
    uploads[fieldname] = filepath;

    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);

    const promise = new Promise((resolve, reject) => {
      file.on('end', () => {
        writeStream.end();
      });
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    fileWrites.push(promise);
  });

  busboy.on('finish', async () => {
    await Promise.all(fileWrites);

    for (const name in uploads) {
      const file = uploads[name];
      // eslint-disable-next-line no-inner-declarations
      storage.upload(file)
      .then((response) => {
        fs.unlinkSync(file);
        req.fileResponse = response;
        req.body = fields;
        return next();
      })
      .catch(console.error);
    }
  });

  busboy.end(req.rawBody);
}

const checkSecret = (req, res, next) => {
  if (req.headers['secret-key'] === hash) {
    return next();
  }

  return res.status(500).send({
    success: false,
    message: 'Wrong secret key.',
  })
}

router.post('/android', checkSecret, uploadFile, async (req, res) => {
  try {
    const {
      version_code,
      playstore_link = '',
      is_force_update,
    } = req.body;

    const isForceUpdate = is_force_update === 'true' ? 1 : 0;
    const link = req.fileResponse[0].metadata.selfLink;

    if (!link) {
      throw new Error('Self link not generated.');
    }

    // Firebase DB doesn't allow "."
    const androidVersionRef = androidRef.child(version_code);
    const updateData = {
      version_code: parseInt(version_code),
      is_force_update: isForceUpdate,
      link,
      playstore_link,
      timestamp: moment().unix(),
    };

    await androidVersionRef.update(updateData);
    updateData.is_force_update = isForceUpdate === 1 ? true : false;

    return res
      .status(200)
      .send({
        success: true,
        data: updateData,
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

router.post('/ios', checkSecret, async (req, res) => {
  try {
    const {
      version_code,
      is_force_update,
      link,
    } = req.body;

    const iosVersionRef = iosRef.child(version_code);
    const isForceUpdate = is_force_update === 'true' ? 1 : 0;

    const updateData = {
      version_code: parseInt(version_code),
      is_force_update: isForceUpdate,
      link,
      timestamp: moment().unix(),
    };

    await iosVersionRef.update(updateData);
    // Change true false bool again lol
    updateData.is_force_update = isForceUpdate === 1 ? true : false;

    return res
      .status(200)
      .send({
        success: true,
        data: updateData,
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
