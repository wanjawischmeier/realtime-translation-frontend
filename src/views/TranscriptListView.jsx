import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import LanguageSelect from "../components/LanguageSelect";
import { useServerHealth } from "../components/ServerHealthContext";
import { TranscriptListProvider } from "../components/TranscriptListProvider";
import { useToast } from "../components/ToastProvider";

export default function TranscriptListView({ wsUrl }) {
    const { availableTranscriptInfos } = TranscriptListProvider(wsUrl);
    const [lang, setLang] = useState("en");

    const navigate = useNavigate();
    const { addToast } = useToast();
    const serverReachable = useServerHealth();

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
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 select-none">Available Transcripts</h2>
            <div className="flex items-center space-x-3 mb-6">
                <span className="text-white font-medium select-none">Language:</span>
                <LanguageSelect lang={lang} setLang={setLang} />
            </div>
            <ul className="mt-4 my-6">
                {availableTranscriptInfos.map(transcriptInfo => {
                    return (
                        <li key={transcriptInfo.id} className="mb-4">
                            <div className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                                <div>
                                    <div className="text-lg font-semibold text-white">{transcriptInfo.id}</div>
                                    <div className="text-gray-300 text-sm">
                                        First recording: {formatTimestamp(transcriptInfo.firstChunkTimestamp)}
                                    </div>
                                    <div className="text-gray-300 text-sm">
                                        Last recording: {formatTimestamp(transcriptInfo.lastChunkTimestamp)}
                                    </div>
                                </div>
                                <button
                                    className={`ml-4 px-4 py-2 rounded font-bold
                                        ${serverReachable
                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                            : "bg-gray-500 text-gray-300 cursor-not-allowed"
                                        }`}
                                    onClick={async () => {
                                        // TODO: Is also defined in TranscriptDownloadButton, remove duplicate
                                        const res = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/room/${transcriptInfo.id}/transcript/${lang}`);
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
                                        umami.track('transcript-downloaded', {
                                            'room_id': transcriptInfo.id,
                                            'lang': lang
                                        });
                                    }}
                                    disabled={!serverReachable}
                                >
                                    <FiDownload className="inline mr-2" />
                                    Download
                                </button>

                            </div>
                        </li>
                    );
                })}
            </ul>
            <button
                className="w-full py-2 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
                onClick={() => navigate("/")}
            >
                Back
            </button>
        </div >
    );
}
