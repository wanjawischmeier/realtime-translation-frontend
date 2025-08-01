import { useRef, useState, useEffect } from "react";
import StatusLED from "../components/StatusLED";
import TranscriptDisplay from "../components/TranscriptDisplay";
import { useServerHealth } from "../components/ServerHealthContext";
import WhisperStreamerHandler from "../components/WhisperStreamHandler";
import WebSocketHandler from "../components/WebSocketHandler";
import WhisperLines from "../components/WhisperLines";
import { useParams } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import LanguageSelect from "../components/LanguageSelect";

function WhisperLiveKitStreamer() {
  const { room_id } = useParams();
  const { getPassword } = useAuth();
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("en");

  const [wsUrl, setWsUrl] = useState(undefined);
  const serverReachable = useServerHealth();

  const { onWsMessage, lines } = WhisperLines()
  const { wsSend, wsConnected } = WebSocketHandler({ wsUrl, onMessage: onWsMessage, serverReachable: serverReachable })
  const { startStreaming, stopStreaming, streaming } = WhisperStreamerHandler({ serverReachable: serverReachable, wsConnected: wsConnected, wsSend: wsSend })

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);
  useEffect(() => {
    setWsUrl(`ws://${import.meta.env.VITE_BACKEND_URL}/room/${room_id}/${"host"}/${sourceLang}/${targetLang}/${getPassword()}`)
  }, [sourceLang, targetLang])

  const handleButtonClick = () => {
    if (streaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };


  return (
    <div>
      {/* Title at top left */}
      <h1 className="text-2xl font-bold mb-8 text-white">SSC Übersetzer</h1>


      {/* URL input and button on one line */}
      <div className="flex items-center w-full space-x-4 mb-4 mt-2">


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
      <div className="flex flex-col w-full space-x-4 mb-4 mt-2 space-y-4">
        <LanguageSelect lang={sourceLang} setLang={setSourceLang}></LanguageSelect>
        <LanguageSelect lang={targetLang} setLang={setTargetLang}></LanguageSelect>
      </div>

      <TranscriptDisplay lines={lines}></TranscriptDisplay>
    </div>
  );
}

export default WhisperLiveKitStreamer;
