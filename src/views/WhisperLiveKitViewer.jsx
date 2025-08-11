import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useServerHealth } from "../components/ServerHealthContext";
import TranscriptDisplay from "../components/TranscriptDisplay";
import WebSocketHandler from "../components/WebSocketHandler";
import useWhisperLines from "../components/WhisperLines";
import { useEffect } from "react";
import { RoomsProvider } from "../components/RoomsProvider";
import LanguageSelect from "../components/LanguageSelect";
import TranscriptDownloadButton from "../components/TranscriptDownloadButton";

export default function WhisperLiveKitViewer() {
  const { room_id } = useParams();
  const navigate = useNavigate();
  const { rooms } = RoomsProvider();
  const [targetLang, setTargetLang] = useState("en");

  const room = rooms.find(r => r.id === room_id);
  const [wsUrl, setWsUrl] = useState(null);
  const serverReachable = useServerHealth();

  const { onWsMessage, lines, incompleteSentence, readyToRecieveAudio, setReadyToRecieveAudio } = useWhisperLines();
  const { wsSend, wsConnected } = WebSocketHandler({
    wsUrl, onMessage: onWsMessage, serverReachable: serverReachable,
    isHost: false,
    onError: (code, message) => navigate('/')
  });

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);
  useEffect(() => { // TODO: What do you mean ${"client"}? Same in WhisperLiveKitStreamer.jsx
    setWsUrl(`ws://${import.meta.env.VITE_BACKEND_URL}/room/${room_id}/${"client"}/${undefined}/${targetLang}`)
  }, [targetLang]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 text-white">SCC Übersetzer</h1>
      <div className="flex items-center w-full justify-end mb-4 mt-2">
        {/* Right side: Download */}
        <TranscriptDownloadButton
          serverReachable={serverReachable}
          roomId={room_id}
          targetLang={targetLang}
        />
      </div>
      <div className="flex flex-col w-full space-x-4 mb-4 mt-2 space-y-4">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-white font-medium select-none">Target:</span>
          <LanguageSelect lang={targetLang} setLang={setTargetLang}></LanguageSelect>
        </div>
      </div>

      <TranscriptDisplay lines={lines} incompleteSentence={incompleteSentence} targetLang={targetLang}></TranscriptDisplay>

      <button
        className="mt-8 w-full py-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
        onClick={() => navigate("/rooms")}
      >
        Back
      </button>
    </div>
  );
}
