import { useNavigate } from "react-router-dom";
import StatusLED from "../components/StatusLED";
import { useServerHealth } from "../components/ServerHealthContext";

export default function RoomListView({ rooms, createdRoomIds = [] }) {
    const navigate = useNavigate();
    const serverReachable = useServerHealth();

    function handleJoin(room) {
        if (createdRoomIds.includes(room.id)) {
            navigate(`/room/${room.id}/stream`);
        } else {
            navigate(`/room/${room.id}/view`);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
            <div className="relative bg-gray-800 rounded-xl shadow-lg p-8 max-w-lg w-full">
                <StatusLED status={serverReachable} />
                <h2 className="text-2xl font-bold text-white mb-6 select-none">Available Rooms</h2>
                <ul className="mb-6">
                    {rooms.map(room => (
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
                                    {createdRoomIds.includes(room.id) ? "Enter as Presenter" : "Join as Viewer"}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                <button
                    className="w-full py-2 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
                    onClick={() => navigate("/")}
                >
                    Back
                </button>
            </div>
        </div>
    );
}
