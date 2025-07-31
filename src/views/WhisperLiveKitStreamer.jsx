import { useRef, useState, useEffect } from "react";
import StatusLED from "../components/StatusLED";
import TranscriptDisplay from "../components/TranscriptDisplay";
import { useServerHealth } from "../components/ServerHealthContext";
import WhisperStreamerHandler from "../components/WhisperStreamHandler";
import WebSocketHandler from "../components/WebSocketHandler";
import WhisperLines from "../components/WhisperLines";

function WhisperLiveKitStreamer() {
  const [wsUrl, setWsUrl] = useState("ws://localhost:8000/asr");
  const serverReachable = useServerHealth();
  
  const {onWsMessage, lines} = WhisperLines()
  const {wsSend, wsConnected} = WebSocketHandler({wsUrl,onMessage:onWsMessage,serverReachable:serverReachable})
  const {startStreaming, stopStreaming, streaming} = WhisperStreamerHandler({serverReachable:serverReachable,wsConnected:wsConnected,wsSend:wsSend})

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleButtonClick = () => {
    if (streaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };


  return (
    <div
      className="relative bg-gray-800 rounded-xl shadow-lg flex flex-col w-full max-w-[1000px] h-[600px] mx-auto"
      style={{ padding: 32 }}
    >
      {/* Title at top left */}
      <div className="absolute top-8 left-8 text-2xl font-bold text-white pointer-events-none select-none">
        SSC Übersetzer
      </div>
      <StatusLED status={wsConnected} />

      {/* Spacer for title */}
      <div className="h-10" />

      {/* URL input and button on one line */}
      <div className="flex items-center w-full space-x-4 mb-4 mt-2">
        <input
          type="text"
          value={wsUrl}
          onChange={e => setWsUrl(e.target.value)}
          className="flex-1 px-4 py-2 h-12 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          disabled={streaming}
          placeholder="ws://localhost:8000/asr"
        />

        <button
          className={`
          flex items-center justify-center 
          w-12 h-12
          transition
          ${streaming
              ? "bg-gradient-to-br from-blue-700 to-blue-900 text-white"
              : serverReachable
                ? "bg-gray-700 text-white"
                : "bg-gray-900 text-gray-300 cursor-not-allowed"
            }
          rounded-lg shadow-md
          focus:outline-none
        `}
          onClick={handleButtonClick}
          disabled={!serverReachable}
        >
          {streaming ? (
            // Stop: blueish square with rounded corners and a stop icon
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="8" y="8" width="12" height="12" rx="3" fill="#fff" />
            </svg>
          ) : (
            // Start: red circle in the center of a square
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="8" fill="#ef4444" />
            </svg>
          )}
        </button>
      </div>
      <TranscriptDisplay lines={lines}></TranscriptDisplay>
    </div>
  );
}

export default WhisperLiveKitStreamer;
