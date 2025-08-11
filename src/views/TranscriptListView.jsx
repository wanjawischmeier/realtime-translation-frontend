import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import LanguageSelect from "../components/LanguageSelect";
import { useServerHealth } from "../components/ServerHealthContext";
import { TranscriptListProvider } from "../components/TranscriptListProvider";
import { useToast } from "../components/ToastProvider";
import { RoomsProvider } from "../components/RoomsProvider";

export default function TranscriptListView({ wsUrl }) {
    const { availableTranscriptInfos } = TranscriptListProvider(wsUrl);
    const [lang, setLang] = useState(null);

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
        <div className="h-full flex flex-col p-4 bg-gray-800 text-white">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-4 select-none text-center">
                Available Transcripts
            </h1>
            <hr className="h-px mb-4 text-gray-600 border-2 bg-gray-600" />

            {/* Language Selector */}
            <div className="flex items-center space-x-3 mb-4">
                <span className="font-medium select-none">Language:</span>
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
                        )) : (
                            <div className="flex-grow flex justify-center items-center m-8">
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
