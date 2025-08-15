import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useServerHealth } from "../components/ServerHealthContext";
import TranscriptDisplay from "../components/TranscriptDisplay";
import WebSocketHandler from "../components/WebSocketHandler";
import useWhisperLines from "../components/WhisperLines";
import { useEffect } from "react";
import LanguageSelect from "../components/LanguageSelect";
import { RoomsProvider } from "../components/RoomsProvider";
import { TranscriptListProvider } from "../components/TranscriptListProvider";
import TranscriptDownloadButton from "../components/TranscriptDownloadButton";
import LoadHandler from "../components/LoadHandler";
import { useFullscreen } from "../help/useFullscreen";

export default function WhisperLiveKitViewer() {
  const [wsUrl, setWsUrl] = useState(null);
  const { room_id } = useParams();
  const serverReachable = useServerHealth();
  const { availableTranscriptInfos } = TranscriptListProvider();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onWsMessage, lines, incompleteSentence } = useWhisperLines();
  const { } = WebSocketHandler({
    wsUrl, onMessage: onWsMessage, serverReachable: serverReachable,
    isHost: false,
    onError: (code, message) => navigate('/')
  });

  const { rooms, availableTargetLangs } = RoomsProvider();
  const [targetLang, setTargetLang] = useState(null);
  const [canDownload, setCanDownload] = useState(false);

  const fullscreenContainerRef = useRef(null);
  const { isFullscreen, toggleFullscreen, isMobile } = useFullscreen();
  const onToggleFullscreen = () => {
    if (fullscreenContainerRef.current) {
      toggleFullscreen(fullscreenContainerRef.current);

      if (isMobile) {
        // Optionally: additional logic for mobile fullscreen toggle
        // e.g. use Screen Orientation API or other hacks if needed
      }
    }
  };

  useEffect(() => {
    const matchingAvailableTranscripts = availableTranscriptInfos.filter(
      transcriptInfo => transcriptInfo.code === room_id
    );

    setCanDownload(matchingAvailableTranscripts.length > 0);
  }, [availableTranscriptInfos]);

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
    setWsUrl(`${import.meta.env.VITE_BACKEND_WS}/room/${room_id}/client/${undefined}/${targetLang}`)
  }, [targetLang]);

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  if (!wsUrl) {
    return (
      <LoadHandler title={t("page.room-view.viewer")} backNavigation={"/rooms/view"}></LoadHandler>
    );
  } else {
    return (
      <div className="p-4">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-4 select-none text-center text-white">{t("page.room-view.viewer")}</h1>
        <hr className="h-px mb-8 text-gray-600 border-2 bg-gray-600"></hr>

        <div className="flex items-center w-full justify-end mb-4 mt-2">
          {/* Right side: Download */}
          <TranscriptDownloadButton
            roomId={room_id}
            targetLang={targetLang}
            disabled={!canDownload}
          />
        </div>
        <div className="flex flex-col w-full space-x-4 mb-4 mt-2 space-y-4">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-white font-medium select-none">{t("page.room-view.language-select.target-label")}:</span>
            <LanguageSelect
              lang={targetLang}
              setLang={setTargetLang}
              languages={availableTargetLangs}
            />
          </div>
        </div>

        {/* Transcript Area */}
        <div
          ref={fullscreenContainerRef}
          className={`relative rounded-lg bg-gray-900 overflow-auto ${isFullscreen ? "fixed top-0 left-0 w-full h-full z-50" : ""
            }`}
          style={{ transition: "all 0.3s ease" }}
        >
          {/* Fullscreen toggle button */}
          <button
            onClick={onToggleFullscreen}
            className="absolute top-2 right-2 z-50 bg-gray-700 rounded p-1 hover:bg-gray-600 text-white"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            type="button"
          >
            {isFullscreen ? <MdFullscreenExit size={24} /> : <MdFullscreen size={24} />}
          </button>

          {/* Transcript Display */}
          <TranscriptDisplay
            lines={lines}
            incompleteSentence={incompleteSentence}
            targetLang={targetLang}
          />
        </div>
        
        <button
          className="mt-8 w-full py-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
          onClick={() => navigate("/rooms")}
        >
          {t("page.room-view.back")}
        </button>
      </div>
    );
  }
}
