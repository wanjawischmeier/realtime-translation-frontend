import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TranscriptDisplay from "../components/TranscriptDisplay";
import { useServerHealth } from "../components/ServerHealthContext";
import WhisperStreamerHandler from "../components/WhisperStreamerHandler";
import WebSocketHandler from "../components/WebSocketHandler";
import useWhisperLines from "../components/WhisperLines";
import { useParams } from "react-router-dom";
import LanguageSelect from "../components/LanguageSelect";
import RecorderButton from "../components/RecorderButton";
import RestartButton from "../components/RestartButton";
import TranscriptDownloadButton from "../components/TranscriptDownloadButton";

function WhisperLiveKitStreamer() {
  const { room_id } = useParams();
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("en");

  const [wsUrl, setWsUrl] = useState(null);
  const serverReachable = useServerHealth();

  const navigate = useNavigate();
  const { onWsMessage, lines, incompleteSentence, readyToRecieveAudio, setReadyToRecieveAudio } = useWhisperLines();
  const { wsSend, wsConnected, sendRestartBackendSignal } = WebSocketHandler({
    wsUrl,
    onMessage: onWsMessage,
    serverReachable: serverReachable,
    isHost: true,
    onError: (code, message) => navigate('/')
  });
  const { startStreaming, stopStreaming, streaming, monitor } = WhisperStreamerHandler({
    serverReachable: serverReachable,
    wsConnected: wsConnected,
    wsSend: wsSend
  })

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, incompleteSentence]);

  useEffect(() => {
    setWsUrl(`ws://${import.meta.env.VITE_BACKEND_URL}/room/${room_id}/${"host"}/${sourceLang}/${targetLang}`)
  }, [sourceLang, targetLang]);

  const restartBackend = () => {
    setReadyToRecieveAudio(false);
    stopStreaming();
    sendRestartBackendSignal();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 text-white">SSC Übersetzer</h1>
      <div className="flex items-center w-full justify-between mb-4 mt-2">
        {/* Left side: Recorder and Restart */}
        <div className="flex items-center gap-2">
          <RecorderButton
            disabled={!serverReachable || !readyToRecieveAudio}
            stopStreaming={stopStreaming}
            startStreaming={startStreaming}
            streaming={streaming}
            monitor={monitor}
          />
          <RestartButton
            disabled={!serverReachable}
            onClick={restartBackend}
          />
        </div>

        {/* Right side: Download */}
        <TranscriptDownloadButton
          serverReachable={serverReachable}
          roomId={room_id}
          targetLang={targetLang}
        />
      </div>
      <div className="flex flex-col w-full space-x-4 mb-4 mt-2 space-y-4">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-white font-medium select-none">Source:</span>
          <LanguageSelect lang={sourceLang} setLang={(lang) => { setSourceLang(lang); setReadyToRecieveAudio(false); }}></LanguageSelect>
        </div>
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-white font-medium select-none">Target:</span>
          <LanguageSelect lang={targetLang} setLang={setTargetLang}></LanguageSelect>
        </div>
      </div>

      <TranscriptDisplay lines={lines} incompleteSentence={incompleteSentence}></TranscriptDisplay>
    </div>
  );
}

export default WhisperLiveKitStreamer;
