import { useRef, useState } from "react";

const WhisperStreamerHandler = ({ serverReachable, wsConnected, wsSend }) => {
  const [streaming, setStreaming] = useState(false);
  const mediaRecorderRef = useRef(null);
  const micStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  const startStreaming = async () => {
    if (!serverReachable || !wsConnected) return;
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStreamRef.current = stream;

    // Create an AudioContext and AnalyserNode
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;
    source.connect(analyserRef.current);
    dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus"
    });

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        wsSend(e.data);
      }
    };

    mediaRecorderRef.current.onstart = () => {
      setStreaming(true);
    };

    mediaRecorderRef.current.onstop = () => {
      setStreaming(false);
    };

    mediaRecorderRef.current.start(250);
  };

  const stopStreaming = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setStreaming(false);
  };



  return { startStreaming, stopStreaming, streaming, monitor: {analyserRef, dataArrayRef} };
};

export default WhisperStreamerHandler;
