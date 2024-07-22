// src/TextToSpeech.js
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const audioRef = useRef(null);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [error, setError] = useState('');

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
      setError('Error generating audio.');
      console.error("Error generating audio:", err);
    }
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioUrl]);

  const handleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        setAudioChunks((prev) => [...prev, e.data]);
      };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.wav');
        try {
          const response = await axios.post('http://localhost:5000/transcribe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          setTranscript(response.data.channels[0].alternatives[0].transcript);
        } catch (err) {
          setError('Error transcribing audio.');
          console.error("Error transcribing audio:", err);
        } finally {
          setAudioChunks([]);
        }
      };
      mediaRecorderRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  return (
    <div>
      <h1>Text to Speech</h1>
      <textarea value={text} onChange={handleTextChange} rows="4" cols="50" />
      <br />
      <button onClick={handleGenerateClick}>Generate</button>
      <br />
      {audioUrl && <audio ref={audioRef} controls src={audioUrl} />}
      <h1>Speech to Text</h1>
      <button onClick={handleRecord}>{isRecording ? 'Stop Recording' : 'Start Recording'}</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>{transcript}</p>
    </div>
  );
};

export default TextToSpeech;
