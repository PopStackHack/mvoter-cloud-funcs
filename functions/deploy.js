const admin = require('firebase-admin');
const express = require('express');
const path = require('path');
const os = require('os');
const fs = require('fs');
const Busboy = require('busboy');
const serviceAccount = require('../serviceAccount.json');
const { firebaseConfig } = require('firebase-functions');
const router = express.Router();

const databaseURL = firebaseConfig().databaseURL;
const storageBucket = firebaseConfig().storageBucket;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL,
  storageBucket,
});

const storage = admin.storage().bucket(storageBucket);
const db = admin.database();
const androidRef = db.ref('android_version');

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

router.post('/android', uploadFile, async (req, res) => {
  try {
    const {
      version_code,
      is_force_update,
    } = req.body;

    const selfLink = req.fileResponse[0].metadata.selfLink;

    if (!selfLink) {
      throw new Error('Self link not generated.');
    }

    // Firebase DB doesn't allow "."
    const androidVersionRef = androidRef.child(version_code.split('.').join('-'));
    androidVersionRef.update({
      version_code,
      is_force_update,
      link: selfLink,
    });

    return res
      .status(200)
      .send(true);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(false);
  }
});

router.post('/ios', async (req, res) => {
  try {
    const {
      version_code,
      is_force_update,
      link,
    } = req.body;

    const iosVersionRef = androidRef.child(version_code.split('.').join('-'));
    iosVersionRef.update({
      version_code,
      is_force_update,
      link,
    });

    return res
      .status(200)
      .send(true);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send();
  }
});

module.exports = router;
