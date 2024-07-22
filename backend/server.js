// server.js
const express = require('express');
const { createClient } = require('@deepgram/sdk');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const deepgramApiKey = "570562113a4a92e6ff97955b790fe729ea9ed551";

app.use(cors());
app.use(express.json());

app.post('/speak', async (req, res) => {
  const { text } = req.body;
  const outputFile = "audio.mp3";
  const deepgram = createClient(deepgramApiKey);

  try {
    const response = await deepgram.speak.request(
      { text },
      {
        model: 'aura-asteria-en',
      }
    );

    const stream = await response.getStream();
    if (stream) {
      const file = fs.createWriteStream(outputFile);
      await pipeline(stream, file);
      res.sendFile(`${__dirname}/${outputFile}`);
    } else {
      res.status(500).send("Error generating audio");
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
