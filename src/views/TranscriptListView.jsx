import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import LanguageSelect from "../components/LanguageSelect";
import { useServerHealth } from "../components/ServerHealthContext";
import { TranscriptListProvider } from "../components/TranscriptListProvider";
import { useToast } from "../components/ToastProvider";
import { RoomsProvider } from "../components/RoomsProvider";
import Spinner from "../components/Spinner";
import { useTranslation } from "react-i18next";
import trackUmami from "../help/umamiHelper";

export default function TranscriptListView() {
    const { availableTranscriptInfos } = TranscriptListProvider();
    const [lang, setLang] = useState(null);

    const { t } = useTranslation();

    const navigate = useNavigate();
    const { addToast } = useToast();
    const serverReachable = useServerHealth();
    const { availableTargetLangs } = RoomsProvider();

    // Helper function to format unix timestamp to readable date/time
    const formatTimestamp = (ts) => {
        if (!ts) return "N/A";
        // Convert seconds to ms, create Date
        const d = new Date(ts * 1000);
        // Options: full date, weekday, etc.
        return d.toLocaleString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    // TODO: Is also defined in TranscriptDownloadButton, remove duplicate
    const getTimestampedTranscriptFilename = (roomId, targetLang) => {
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const year = now.getFullYear();
        const month = pad(now.getMonth() + 1); // Months are 0-indexed
        const day = pad(now.getDate());
        const hour = pad(now.getHours());
        const minute = pad(now.getMinutes());
        return `transcript_${roomId}_${targetLang}_${year}-${month}-${day}_${hour}-${minute}.txt`;
    }

    return (
        <div className="h-full flex flex-col p-4 text-white">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-4 select-none text-center">
                {t("page.transcript.title")}
            </h1>
            <hr className="h-px mb-4 text-gray-600 border-2 bg-gray-600" />

            {/* Language Selector */}
            <div className="flex items-center space-x-3 mb-4">
                <span className="font-medium select-none">{t("page.transcript.language-select-label")}:</span>
                <LanguageSelect lang={lang} setLang={setLang} languages={availableTargetLangs} />
            </div>

            {/* Scrollable List Area */}
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 max-h-[calc(100vh-250px)]">
                {
                    (availableTranscriptInfos.length > 0) ?
                        availableTranscriptInfos.map((transcriptInfo) => (
                            <div
                                key={transcriptInfo.id}
                                className="flex justify-between items-center bg-gray-700 p-4 rounded-lg"
                            >
                                <div>
                                    <div className="text-lg font-semibold">{transcriptInfo.id}</div>
                                    <div className="text-gray-300 text-sm">
                                        {t("page.transcript.timestamp.first-title")}: {formatTimestamp(transcriptInfo.firstChunkTimestamp)}
                                    </div>
                                    <div className="text-gray-300 text-sm">
                                        {t("page.transcript.timestamp.last-title")}: {formatTimestamp(transcriptInfo.lastChunkTimestamp)}
                                    </div>
                                </div>
                                <button
                                    className={`ml-4 px-4 py-2 rounded font-bold
                                ${serverReachable
                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                            : "bg-gray-500 text-gray-300 cursor-not-allowed"
                                        }`}
                                    onClick={async () => {
                                        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/room/${transcriptInfo.id}/transcript/${lang}`);
                                        const text = await res.text();
                                        if (!text) {
                                            addToast({
                                                title: "No transcript",
                                                message: `Couldn't find any transcriptions for ${transcriptInfo.id} in ${lang}. Sorry :/`,
                                                type: "warning",
                                            });
                                            return;
                                        }

                                        const blob = new Blob([text], { type: 'text/plain' });
                                        const url = window.URL.createObjectURL(blob);

                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = getTimestampedTranscriptFilename(transcriptInfo.id, lang);
                                        document.body.appendChild(link);
                                        link.click();

                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                        trackUmami('transcript-downloaded', {
                                                'room_id': transcriptInfo.id,
                                                'lang': lang
                                            });
                                    }}
                                    disabled={!serverReachable}
                                >
                                    <FiDownload className="inline mr-2" />
                                    {t("page.transcript.download")}
                                </button>
                            </div>
                        )) : (
                            <Spinner></Spinner>
                        )
                }
            </div>

            {/* Back Button */}
            <button
                className="mt-4 py-3 w-full rounded bg-gray-600 hover:bg-gray-700 font-bold"
                onClick={() => navigate("/")}
            >
                Back
            </button>
        </div>
    );
}
