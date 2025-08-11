import { useNavigate } from "react-router-dom";
import { useServerHealth } from "../components/ServerHealthContext";

function StartView() {
    const navigate = useNavigate();
    const serverReachable = useServerHealth();

    return (
        <div className="h-full flex flex-col p-4 bg-gray-800 text-white">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-4 text-center select-none">
                Realtime Translation
            </h1>
            <hr className="h-px mb-4 text-gray-600 border-2 bg-gray-600" />

            {/* Scrollable button stack */}
            <div className="flex-grow overflow-y-auto space-y-4 pr-2 max-h-[calc(100vh-180px)]">
                <button
                    className={`w-full py-3 rounded-lg font-bold text-lg
                        ${serverReachable
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-blue-900 text-gray-400 cursor-not-allowed"
                        }`}
                    onClick={() => navigate("/rooms/host")}
                    disabled={!serverReachable}
                >
                    Join as Host
                </button>

                <button
                    className={`w-full py-3 rounded-lg font-bold text-lg
                        ${serverReachable
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-green-900 text-gray-400 cursor-not-allowed"
                        }`}
                    onClick={() => navigate("/rooms")}
                    disabled={!serverReachable}
                >
                    Join as Viewer
                </button>

                <button
                    className={`w-full py-3 rounded-lg font-bold text-lg
                        ${serverReachable
                            ? "bg-gray-600 hover:bg-gray-700 text-white"
                            : "bg-gray-500 text-gray-400 cursor-not-allowed"
                        }`}
                    onClick={() => navigate("/transcripts")}
                    disabled={!serverReachable}
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