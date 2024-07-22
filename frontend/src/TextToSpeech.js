// src/TextToSpeech.js
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const audioRef = useRef(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleGenerateClick = async () => {
    try {
      const response = await axios.post('http://localhost:5000/speak', { text }, { responseType: 'blob' });
      const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
    } catch (err) {
      console.error("Error generating audio:", err);
    }
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioUrl]);

  return (
    <div>
      <h1>Text to Speech</h1>
      <textarea value={text} onChange={handleTextChange} rows="4" cols="50" />
      <br />
      <button onClick={handleGenerateClick}>Generate</button>
      <br />
      {audioUrl && <audio ref={audioRef} controls src={audioUrl} />}
    </div>
  );
};

export default TextToSpeech;
