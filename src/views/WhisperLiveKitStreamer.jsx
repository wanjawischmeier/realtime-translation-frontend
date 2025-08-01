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
import RecorderButton from "../components/RecorderButton";

function WhisperLiveKitStreamer() {
  const { room_id } = useParams();
  const { getPassword } = useAuth();
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("en");

  const [wsUrl, setWsUrl] = useState(null);
  const serverReachable = useServerHealth();

  const { onWsMessage, lines } = WhisperLines()
  const { wsSend, wsConnected } = WebSocketHandler({ wsUrl, onMessage: onWsMessage, serverReachable: serverReachable })
  const { startStreaming, stopStreaming, streaming, monitor } = WhisperStreamerHandler({ serverReachable: serverReachable, wsConnected: wsConnected, wsSend: wsSend })

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);
  useEffect(() => {
    setWsUrl(`ws://${import.meta.env.VITE_BACKEND_URL}/room/${room_id}/${"host"}/${sourceLang}/${targetLang}/${getPassword()}`)
  }, [sourceLang, targetLang])

  return (
    <div>
      {/* Title at top left */}
      <h1 className="text-2xl font-bold mb-8 text-white">SSC Übersetzer</h1>


      {/* URL input and button on one line */}
      <div className="flex items-center w-full space-x-4 mb-4 mt-2">

      <RecorderButton serverReachable={serverReachable} stopStreaming={stopStreaming} startStreaming={startStreaming} streaming={streaming} monitor={monitor}></RecorderButton>

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
