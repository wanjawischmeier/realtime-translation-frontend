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
import { RoomsProvider } from "../components/RoomsProvider";
import TranscriptDownloadButton from "../components/TranscriptDownloadButton";
import LoadHandler from "../components/LoadHandler";
import { useTranslation } from "react-i18next";

function WhisperLiveKitStreamer() {
  const [wsUrl, setWsUrl] = useState(null);
  const serverReachable = useServerHealth();

  const { t } = useTranslation();

  const navigate = useNavigate();
  const { onWsMessage, lines, incompleteSentence, readyToRecieveAudio, setReadyToRecieveAudio, reset } = useWhisperLines();
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
  });

  const { room_id } = useParams();
  const { rooms, availableSourceLangs, availableTargetLangs } = RoomsProvider();
  const [sourceLang, setSourceLang] = useState(null);
  const [targetLang, setTargetLang] = useState(null);

  useEffect(() => {
    if (sourceLang) {
      // Languages already initialized
      return;
    }

    const room = rooms.find(r => r.id === room_id);
    if (room && availableSourceLangs.length > 0) {
      var initialSourceLang = null;
      if (room.source_lang && availableSourceLangs.includes(room.source_lang)) {
        // Room already initialized with a language
        initialSourceLang = room.source_lang;
      } else {
        // Otherwise just default to the first one
        initialSourceLang = availableSourceLangs[0];
      }

      if (initialSourceLang) {
        setSourceLang(initialSourceLang);
        setTargetLang(initialSourceLang);
      }
    }
  }, [rooms]);

  useEffect(() => {
    if (!sourceLang || !targetLang) {
      return;
    }

    setWsUrl(`${import.meta.env.VITE_BACKEND_WS}/room/${room_id}/host/${sourceLang}/${targetLang}`)
  }, [sourceLang, targetLang]);

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, incompleteSentence, targetLang]);

  const restartBackend = () => {
    setReadyToRecieveAudio(false);
    reset();
    stopStreaming();
    sendRestartBackendSignal();
  };

  if (!wsUrl) {
    return (
      <LoadHandler title={t("page.host.title")} backNavigation={"/rooms/host"}></LoadHandler>
    );
  } else {

    return (
      <div className="p-4">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-4 select-none text-center text-white">{t("page.host.title")}</h1>
        <hr className="h-px mb-8 text-gray-600 border-2 bg-gray-600"></hr>

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
            <span className="text-white font-medium select-none">{t("page.host.language-select.source-label")}:</span>
            <LanguageSelect
              lang={sourceLang}
              setLang={(lang) => {
                setSourceLang(lang);
                setReadyToRecieveAudio(false);
                reset();
              }}
              languages={availableSourceLangs}
            />
          </div>
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-white font-medium select-none">{t("page.host.language-select.target-label")}:</span>
            <LanguageSelect
              lang={targetLang}
              setLang={(lang) => {
                setTargetLang(lang);
                reset();
              }}
              languages={availableTargetLangs}
            />
          </div>
        </div>
        <TranscriptDisplay lines={lines} incompleteSentence={incompleteSentence} targetLang={targetLang}></TranscriptDisplay>

        <button
          className="mt-8 w-full py-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
          onClick={() => navigate("/rooms/host")}
        >
          {t("page.host.back")}
        </button>
      </div>
    );
  }
}

export default WhisperLiveKitStreamer;
