import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../components/AuthContext";
import { MdBuild } from "react-icons/md";

function StartView() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { role } = useAuth();

    // Evaluate "true" string as Boolean
    const isMaintenance = import.meta.env.VITE_SERVER_MAINTENANCE === "true";

    return (
        <div className="h-full flex flex-col p-4 text-white">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-4 text-center select-none">
                {t("page.startpage.title")}
            </h1>
            <hr className="h-px mb-4 text-gray-600 border-2 bg-gray-600" />

            {isMaintenance ? (
                // Maintenance message
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <MdBuild size={60} className="text-yellow-400 mb-6" />
                    <div className="text-2xl font-semibold mb-2">
                        {t("page.startpage.maintenance.header")}
                    </div>
                    <div className="text-md text-gray-300">
                        {t("page.startpage.maintenance.message")}
                    </div>
                </div>
            ) : (
                // Scrollable button stack
                <div className="flex-grow overflow-y-auto space-y-4 pr-2 max-h-[calc(100vh-180px)]">
                    <button
                        className="w-full py-3 rounded-lg font-bold text-lg bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => navigate("/rooms/host")}
                    >
                        {t("page.startpage.join-host")}
                    </button>

                    <button
                        className="w-full py-3 rounded-lg font-bold text-lg bg-green-600 text-white hover:bg-green-700"
                        onClick={() => navigate("/rooms")}
                    >
                        {t("page.startpage.join-viewer")}
                    </button>

                    <button
                        className="w-full py-3 rounded-lg font-bold text-lg bg-gray-600 hover:bg-gray-700 text-white"
                        onClick={() => navigate("/transcripts")}
                    >
                        {t("page.startpage.download-transcript")}
                    </button>

                    <button
                        className="w-full py-3 rounded-lg font-bold text-lg bg-gray-600 hover:bg-gray-700 text-white"
                        onClick={() => navigate("/help")}
                    >
                        {t("page.startpage.help")}
                    </button>

                    {role === "admin" && (
                        <button
                            className="w-full py-3 font-size-20 rounded-lg font-bold text-lg bg-red-800 hover:bg-red-900 text-white"
                            onClick={() => navigate("/rooms/admin")}
                        >
                            {t("page.startpage.admin")}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default StartView;
