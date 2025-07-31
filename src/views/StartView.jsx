import { useNavigate } from "react-router-dom";
import StatusLED from "../components/StatusLED";
import { useServerHealth } from "../components/ServerHealthContext";

function StartView() {
    const navigate = useNavigate();
    const serverReachable = useServerHealth();

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8 select-none">SSC Übersetzer</h1>
            <button
                className={`w-full mb-4 py-3 rounded-lg font-bold text-lg
                        ${serverReachable
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-900 text-gray-400 cursor-not-allowed"
                    }`}
                onClick={() => navigate("/create")}
                disabled={!serverReachable}
            >
                Create a Room
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
                Join Existing Room
            </button>
        </div>
    );

}

export default StartView;