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
  const [wsUrl, setWsUrl] = useState(null);
  const serverReachable = useServerHealth();

  const navigate = useNavigate();
  const { onWsMessage, lines, incompleteSentence } = useWhisperLines();
  const { } = WebSocketHandler({
    wsUrl, onMessage: onWsMessage, serverReachable: serverReachable,
    isHost: false,
    onError: (code, message) => navigate('/')
  });

  const { room_id } = useParams();
  const { rooms, availableTargetLangs } = RoomsProvider();
  const [targetLang, setTargetLang] = useState(null);

  useEffect(() => {
    if (targetLang) {
      // Target language already initialized
      return;
    }

    const room = rooms.find(r => r.id === room_id);
    if (room && availableTargetLangs.length > 0) {
      var initialTargetLang = null;
      if (room.source_lang && availableTargetLangs.includes(room.source_lang)) {
        // Room already initialized with a language
        initialTargetLang = room.source_lang;
      } else {
        // Otherwise just default to the first one
        initialTargetLang = availableTargetLangs[0];
      }

      if (initialTargetLang) {
        setTargetLang(initialTargetLang);
      }
    }
  }, [rooms]);

  useEffect(() => {
    if (!targetLang) {
      return;
    }
    setWsUrl(`ws://${import.meta.env.VITE_BACKEND_URL}/room/${room_id}/client/${undefined}/${targetLang}`)
  }, [targetLang]);

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  if (!wsUrl) {
    return (
      <div className="h-100 flex flex-col p-4">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-4 select-none text-center">View</h1>
        <hr className="h-px mb-8 text-gray-600 border-2 bg-gray-600"></hr>

        <div className="flex-grow flex justify-center items-center">
          {/* https://flowbite.com/docs/components/spinner */}
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-16 h-16 animate-spin text-gray-700 fill-blue-700"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>

        {/* Back button at bottom */}
        <button
          className="mt-auto w-full py-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
          onClick={() => navigate("/rooms/host")}
        >
          Back
        </button>
      </div>
    );

  }

  return (
    <div className="p-4">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-4 select-none text-center">View</h1>
      <hr className="h-px mb-8 text-gray-600 border-2 bg-gray-600"></hr>

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
          <LanguageSelect
            lang={targetLang}
            setLang={setTargetLang}
            languages={availableTargetLangs}
          />
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
