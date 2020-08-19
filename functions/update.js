app.post('/android', async (req, res) => {
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

app.post('/ios', async (req, res) => {
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