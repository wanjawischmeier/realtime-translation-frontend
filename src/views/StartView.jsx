import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function StartView() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    return (
        <div className="h-full flex flex-col p-4 text-white">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-4 text-center select-none">
                {t("greeting")}
            </h1>
            <hr className="h-px mb-4 text-gray-600 border-2 bg-gray-600" />

            {/* Scrollable button stack */}
            <div className="flex-grow overflow-y-auto space-y-4 pr-2 max-h-[calc(100vh-180px)]">
                <button
                    className="w-full py-3 rounded-lg font-bold text-lg bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => navigate("/rooms/host")}
                >
                    Join as Host
                </button>

                <button
                    className="w-full py-3 rounded-lg font-bold text-lg bg-green-600 text-white hover:bg-green-700"
                    onClick={() => navigate("/rooms")}
                >
                    Join as Viewer
                </button>

                <button
                    className="w-full py-3 rounded-lg font-bold text-lg bg-gray-600 hover:bg-gray-700 text-white"
                    onClick={() => navigate("/transcripts")}
                >
                    Download a transcript
                </button>

                <button
                    className="w-full py-3 rounded-lg font-bold text-lg bg-gray-600 hover:bg-gray-700 text-white"
                    onClick={() => navigate("/help")}
                >
                    Help
                </button>
            </div>
        </div>
    );
}

export default StartView;