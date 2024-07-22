// server.js
const express = require('express');
const { createClient } = require('@deepgram/sdk');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = process.env.PORT || 5000;
const deepgramApiKey = "570562113a4a92e6ff97955b790fe729ea9ed551"; // Ensure your API key is correct

const deepgram = createClient(deepgramApiKey);

app.use(cors());
app.use(express.json());

app.post('/speak', async (req, res) => {
  const { text } = req.body;
  const outputFile = "audio.mp3";

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
    console.error("Error generating audio:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  const audioFile = req.file.path;

  try {
    const audioBuffer = fs.readFileSync(audioFile);
    const response = await deepgram.listen.prerecorded(
      { buffer: audioBuffer, mimetype: 'audio/wav' },
      {
        model: 'nova',
        language: 'en',
        punctuate: true,
      }
    );
    res.json(response.results);
  } catch (err) {
    console.error("Error transcribing audio:", err);
    res.status(500).send("Internal Server Error");
  } finally {
    fs.unlinkSync(audioFile); // Clean up the uploaded file
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
