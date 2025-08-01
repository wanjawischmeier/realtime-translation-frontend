import { useNavigate } from "react-router-dom";
import StatusLED from "../components/StatusLED";
import { useServerHealth } from "../components/ServerHealthContext";
import { RoomsProvider } from "../components/RoomProvider";

export default function RoomListView({ asHost=false }) {
    const { rooms } = RoomsProvider("backendUrl");

    const navigate = useNavigate();
    const serverReachable = useServerHealth();

    function handleJoin(room) {
        if (asHost) {
            navigate(`/room/${room.id}/host`);
        } else {
            navigate(`/room/${room.id}/view`);
        }
    }

    return (
        <div>
            <StatusLED status={serverReachable} />
            <h2 className="text-2xl font-bold text-white mb-6 select-none">Available Rooms</h2>
            <ul className="mb-6">
                {rooms.map(room => {
                    if (room.isActive === asHost) { // Use if statement here
                        return (
                            <li key={room.id} className="mb-4">
                                <div className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                                    <div>
                                        <div className="text-lg font-semibold text-white">{room.name}</div>
                                        <div className="text-gray-300 text-sm">Presenter: {room.presenter} · Language: {room.language}</div>
                                    </div>
                                    <button
                                        className={`ml-4 px-4 py-2 rounded font-bold
                                        ${serverReachable
                                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                                : "bg-blue-900 text-gray-400 cursor-not-allowed"
                                            }`}
                                        onClick={() => handleJoin(room)}
                                        disabled={!serverReachable}
                                    >
                                        {asHost ? "Enter as Presenter" : "Join as Viewer"}
                                    </button>
                                </div>
                            </li>
                        )

                    }
                    return null;
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
