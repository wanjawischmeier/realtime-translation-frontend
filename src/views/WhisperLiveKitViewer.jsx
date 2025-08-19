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
import { getBackendWs } from "../help/url";

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

  useEffect(() => {
    const matchingAvailableTranscripts = availableTranscriptInfos.filter(
      transcriptInfo => transcriptInfo.code === room_id
    );

    setCanDownload(matchingAvailableTranscripts.length > 0);
  }, [availableTranscriptInfos]);

  useEffect(() => {
    const room = rooms.find(r => r.id === room_id);
    document.title = t("page.room-view.viewing") + (room ? room.title : "...") + " - " + t('dom-title')
  }, [room_id]);

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
    setWsUrl(`${getBackendWs()}/room/${room_id}/client/${undefined}/${targetLang}`)
  }, [targetLang]);

  if (!wsUrl) {
    return (
      <LoadHandler title={t("page.room-view.viewer")} backNavigation={"/rooms/view"}></LoadHandler>
    );
  } else {
    return (
      <div className="h-full flex flex-col p-4 text-white w-full">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-4 select-none text-center text-white">{t("page.room-view.viewer")}</h1>
        <hr className="h-px mb-3 text-gray-600 border-2 bg-gray-600"></hr>

        <div className="flex items-center w-full justify-end mb-4 mt-2">
          {/* Right side: Download */}
          <TranscriptDownloadButton
            roomId={room_id}
            targetLang={targetLang}
            disabled={!canDownload}
          />
        </div>
        <div className="flex flex-col w-full gap-4 mb-4">
          <div className="flex items-center gap-4 w-full">
            <span className="text-white font-medium select-none whitespace-nowrap">{t("page.room-view.language-select.target-label")}:</span>
            <LanguageSelect
              customClassName="px-4 p-2 box-border rounded-lg bg-gray-700 text-gray-100 flex-grow"
              lang={targetLang}
              setLang={setTargetLang}
              languages={availableTargetLangs}
            />
          </div>
        </div>

        <TranscriptDisplay
          lines={lines}
          incompleteSentence={incompleteSentence}
          targetLang={targetLang}
        />

        <button
          className="mt-4 w-full py-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
          onClick={() => navigate("/rooms")}
        >
          {t("page.room-view.back")}
        </button>
      </div>
    );
  }
}
