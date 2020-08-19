const express = require('express');

const router = express.Router();

router.post('/android', async (req, res) => {
  try {
    // Check ranges here
    return res
      .status(200)
      .send('OK');
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send();
  }
});

router.post('/ios', async (req, res) => {
  try {
    return res
      .status(200)
      .send('OK');
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send();
  }
});

module.exports = router;
