import { useRef, useState, useEffect } from "react";

function StatusLED({ status }) {
  const color = status ? "bg-green-500" : "bg-red-500";
  return (
    <span className={`absolute top-4 right-4 flex items-center`}>
      <span className={`relative flex h-3 w-3 mr-1`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
      </span>
    </span>
  );
}

function AudioStreamer({ wsUrl }) {
  const [quality, setQuality] = useState(48000);
  const [streaming, setStreaming] = useState(false);
  const [serverReachable, setServerReachable] = useState(false);
  const pcRef = useRef(null);
  const userStreamRef = useRef(null);
  const stoppingRef = useRef(false); // Prevents infinite loops

  // Health check logic
  useEffect(() => {
    let interval;
    const checkServer = async () => {
      try {
        const res = await fetch(`https://${wsUrl}/health`, { method: "GET", cache: 'no-cache' });
        const reachable = res.ok;
        setServerReachable(reachable);

        // If server goes down while streaming, stop the stream
        if (!reachable && streaming && !stoppingRef.current) {
          stoppingRef.current = true;
          await stopStreaming();
          stoppingRef.current = false;
        }
      } catch {
        setServerReachable(false);
        if (streaming && !stoppingRef.current) {
          stoppingRef.current = true;
          await stopStreaming();
          stoppingRef.current = false;
        }
      }
    };
    checkServer();
    interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [wsUrl, streaming]);

  const checkServer = async () => {
    try {
      const res = await fetch(`${serverIp}/health`, { method: "GET", cache: 'no-cache' });
      return res.ok;
    } catch {
      return false;
    }
  };

  const startStreaming = async () => {
    if (!(await checkServer())) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: quality,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      userStreamRef.current = stream;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      stream.getAudioTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch(`${serverIp}/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdp: pc.localDescription.sdp,
          type: pc.localDescription.type
        })
      });

      if (!response.ok) {
        return;
      }

      const answer = await response.json();
      await pc.setRemoteDescription(new window.RTCSessionDescription(answer));

      setStreaming(true);
    } catch (err) {
      // Optionally handle error
    }
  };

  const stopStreaming = async () => {
    try {
      await fetch(`${serverIp}/terminate`, { method: "POST" });
    } catch (err) {
      // Ignore errors here (server might already be closed)
    }
    if (pcRef.current) {
      pcRef.current.getSenders().forEach(sender => sender.track && sender.track.stop());
      pcRef.current.close();
      pcRef.current = null;
    }
    if (userStreamRef.current) {
      userStreamRef.current.getTracks().forEach(track => track.stop());
      userStreamRef.current = null;
    }
    setStreaming(false);
  };

  const handleButtonClick = () => {
    if (streaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  return (
    <div className="relative bg-gray-800 rounded-xl shadow-lg px-8 py-6 flex flex-col items-center space-y-6">
      <StatusLED status={serverReachable} />
      <label className="text-gray-200 text-lg font-semibold">Server IP:Port</label>
      <input
        type="text"
        value={serverIp}
        onChange={e => setServerIp(e.target.value)}
        className="w-56 px-4 py-2 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        disabled={streaming}
      />

      <label className="text-gray-200 text-lg font-semibold">Select Quality:</label>
      <select
        value={quality}
        onChange={e => setQuality(Number(e.target.value))}
        className="w-56 px-4 py-2 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        disabled={streaming}
      >
        <option value={16000}>Low (16kHz)</option>
        <option value={44100}>CD (44.1kHz)</option>
        <option value={48000}>Studio (48kHz)</option>
      </select>

      <button
        className={`w-56 font-bold py-2 rounded-lg shadow-md transition
          ${streaming
            ? "bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white"
            : serverReachable
              ? "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white"
              : "bg-gray-500 text-gray-300 cursor-not-allowed"
          }`}
        onClick={handleButtonClick}
        disabled={!serverReachable}
      >
        {streaming ? "Stop Streaming" : "Start Streaming"}
      </button>
    </div>
  );
}

export default AudioStreamer;
