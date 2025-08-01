import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StatusLED from "../components/StatusLED";
import { useServerHealth } from "../components/ServerHealthContext";
import TranscriptDisplay from "../components/TranscriptDisplay";
import WebSocketHandler from "../components/WebSocketHandler";
import WhisperLines from "../components/WhisperLines";
import { useEffect } from "react";
import { RoomsProvider } from "../components/RoomProvider";

export default function WhisperLiveKitViewer() {
  const { room_id } = useParams();
  const navigate = useNavigate();
  const { rooms } = RoomsProvider();
  const [targetLang, setTargetLang] = useState("en");

  const room = rooms.find(r => r.id === room_id);
  const [wsUrl, setWsUrl] = useState(undefined);
  const serverReachable = useServerHealth();

  const { onWsMessage, lines } = WhisperLines()
  const { wsSend, wsConnected } = WebSocketHandler({ wsUrl, onMessage: onWsMessage, serverReachable: serverReachable })

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);
  useEffect(() => {
    setWsUrl(`ws://${import.meta.env.VITE_BACKEND_URL}/room/${room_id}/${"client"}/${undefined}/${targetLang}/${undefined}`)
  }, [targetLang])

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-white text-center">
          Room not found.
          <button
            className="mt-6 w-full py-2 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
            onClick={() => navigate("/rooms")}
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="text-2xl font-bold text-white flex-1 select-none">{room.name}</div>

      </div>
      <div
        className="w-full bg-gray-900 rounded-lg p-3 text-gray-100 text-base flex flex-col space-y-2 flex-1 overflow-y-auto"
        style={{ minHeight: 120 }}
      >
        <LanguageSelect lang={targetLang} setLang={setTargetLang}></LanguageSelect>
        <TranscriptDisplay lines={lines}></TranscriptDisplay>

      </div>
      <button
        className="mt-8 w-full py-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
        onClick={() => navigate("/rooms")}
      >
        Back
      </button>
    </div>
  );
}
