import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TranscriptDisplay from "../components/TranscriptDisplay";
import { useServerHealth } from "../components/ServerHealthContext";
import WhisperStreamerHandler from "../components/WhisperStreamerHandler";
import WebSocketHandler from "../components/WebSocketHandler";
import useWhisperLines from "../components/WhisperLines";
import LanguageSelect from "../components/LanguageSelect";
import RecorderButton from "../components/RecorderButton";
import RestartButton from "../components/RestartButton";
import { RoomsProvider } from "../components/RoomsProvider";
import TranscriptDownloadButton from "../components/TranscriptDownloadButton";
import LoadHandler from "../components/LoadHandler";

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
    const room = rooms.find(r => r.id === room_id);
     document.title = t("page.room-view.hosting") + ": " + (room ? room.title : "...") + " - " + t('dom-title')
  },[rooms,room_id]);

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
      } else if (availableSourceLangs.includes('de')) {
        // Default to german if available
        initialSourceLang = 'de';
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

  const restartBackend = () => {
    setReadyToRecieveAudio(false);
    reset();
    stopStreaming();
    sendRestartBackendSignal();
  };

  if (!wsUrl) {
    return (
      <LoadHandler title={t("page.room-view.host")} backNavigation={"/rooms/host"}></LoadHandler>
    );
  } else {

    return (
      <div className="h-full flex flex-col p-4 text-white w-full">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-4 select-none text-center text-white">
          {t("page.room-view.host")}
        </h1>
        <hr className="h-px mb-3 text-gray-600 border-2 bg-gray-600"></hr>

        <div className="flex items-center w-full justify-between mb-4 mt-2">

          <div className="flex items-center gap-2">
            <RecorderButton
              disabled={!serverReachable || !wsConnected || !readyToRecieveAudio}
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
          <TranscriptDownloadButton
            roomId={room_id}
            targetLang={targetLang}
          />

        </div>
        <div className="flex flex-col w-full gap-4 mb-4">
          {/** 
          <div className="flex items-center gap-4 w-full">
            <span className="text-white font-medium select-none whitespace-nowrap">{t("page.room-view.language-select.source-label")}:</span>
            <LanguageSelect
              customClassName="px-4 p-2 box-border rounded-lg bg-gray-700 text-gray-100 flex-grow"
              lang={sourceLang}
              setLang={(lang) => {
                setSourceLang(lang);
                setReadyToRecieveAudio(false);
                reset();
              }}
              languages={availableSourceLangs}
            />
          </div>
          */}
          <div className="flex items-center gap-4 w-full">
            <span className="text-white font-medium select-none whitespace-nowrap">{t("page.room-view.language-select.target-label")}:</span>
            <LanguageSelect
              customClassName="px-4 p-2 box-border rounded-lg bg-gray-700 text-gray-100 flex-grow"
              lang={targetLang}
              setLang={(lang) => {
                setTargetLang(lang);
                reset();
              }}
              languages={availableTargetLangs}
            />
          </div>
          
        </div>

        {/* Transcript Area */}
        <TranscriptDisplay
          lines={lines}
          incompleteSentence={incompleteSentence}
          targetLang={targetLang}
        />

        <button
          className="mt-4 w-full py-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
          onClick={() => navigate("/rooms/host")}
        >
          {t("page.room-view.back")}
        </button>
      </div>
    );
  }
}

export default WhisperLiveKitStreamer;
