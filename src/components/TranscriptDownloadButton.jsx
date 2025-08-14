import { useState } from 'react';
import { FiDownload } from "react-icons/fi";
import { useToast } from "./ToastProvider";

export default function TranscriptDownloadButton({ serverReachable, roomId, targetLang }) {
    const [downloading, setDownloading] = useState(false);
    const { addToast } = useToast();

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
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/room/${roomId}/transcript/${targetLang}`);
            const text = await res.text();
            if (!text) {
                addToast({
                    title: "No transcript",
                    message: `Couldn't find any transcriptions for ${roomId} in ${targetLang}. Sorry :/`,
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
                h-12 px-4
                rounded-lg shadow-md transition
                bg-blue-700 text-white hover:bg-blue-900 font-medium
                disabled:bg-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed
            `}
            onClick={handleDownload}
            disabled={downloading || !serverReachable}
        >
            <FiDownload className="inline mr-2" />
            {downloading ? 'Downloading...' : 'Download Transcript'}
        </button>
    );
}
