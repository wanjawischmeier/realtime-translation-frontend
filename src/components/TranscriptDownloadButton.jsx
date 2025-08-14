import { useState } from 'react';
import { FiDownload } from "react-icons/fi";
import { useToast } from "./ToastProvider";
import { useServerHealth } from "./ServerHealthContext";
import { useAuth } from "./AuthContext";

export default function TranscriptDownloadButton({ roomId, targetLang, disabled=false }) {
    const [downloading, setDownloading] = useState(false);
    const serverReachable = useServerHealth();
    const { addToast } = useToast();
    const { getKey } = useAuth();

    const getTimestampedTranscriptFilename = () => {
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const year = now.getFullYear();
        const month = pad(now.getMonth() + 1); // Months are 0-indexed
        const day = pad(now.getDate());
        const hour = pad(now.getHours());
        const minute = pad(now.getMinutes());
        return `transcript_${roomId}_${targetLang}_${year}-${month}-${day}_${hour}-${minute}.txt`;
    }

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/room/${roomId}/transcript/${targetLang}`, {
                method: "POST",
                cache: 'no-cache',
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true", // TODO: remove ngrok workaround in production
                },
                body: JSON.stringify({ key: getKey() }),
            });
            const text = await response.text();
            if (!response.ok || !text) {
                setDownloading(false);
                addToast({
                    title: "No transcript",
                    message: `Couldn't find any transcriptions in the selected language. Sorry :/`,
                    type: "warning",
                });
                return;
            }

            const blob = new Blob([text], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = getTimestampedTranscriptFilename();
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            addToast({
                title: 'Full transcript downloading...',
                message: `Saving as ${link.download}`,
                type: "info",
            });
        } catch (error) {
            addToast({
                title: "Failed to download transcript",
                message: `${error.name}: ${error.message}`,
                type: "error",
            });
        }
        setDownloading(false);
    };

    return (
        <button
            className={`
                flex items-center justify-center
                h-12 px-4 font-medium
                rounded-lg shadow-md transition
                bg-blue-700 text-white hover:bg-blue-900
                disabled:bg-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed
            `}
            onClick={handleDownload}
            disabled={downloading || !serverReachable || disabled}
        >
            <FiDownload className="inline mr-2" />
            {downloading ? 'Downloading...' : 'Download Transcript'}
        </button>
    );
}
