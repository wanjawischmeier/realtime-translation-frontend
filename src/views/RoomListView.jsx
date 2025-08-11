import { useNavigate } from "react-router-dom";
import { useServerHealth } from "../components/ServerHealthContext";
import { RoomsProvider } from "../components/RoomsProvider";
import Cookies from "js-cookie";

export default function RoomListView({ asHost = false }) {
    const { rooms, maxActiveRooms } = RoomsProvider();

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
        <div className="h-full flex flex-col p-4 bg-gray-800 text-white">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-4 select-none text-center">Available rooms</h1>
            <hr className="h-px mb-4 text-gray-600 border-2 bg-gray-600" />

            {/* Scrollable Room List */}
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 max-h-[calc(100vh-250px)]">
                {rooms.map(room => {
                    const connectionId = Cookies.get('connection_id') || '';
                    let allowedIn = false;

                    if (asHost) {
                        allowedIn = room.host_connection_id
                            ? room.host_connection_id === connectionId
                            : true;
                    } else {
                        allowedIn = !!room.host_connection_id;
                    }

                    const canJoin = allowedIn && serverReachable;

                    return (
                        <div key={room.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                            <div>
                                <div className="text-lg font-semibold">{room.title}</div>
                                <div className="text-gray-300 text-sm">
                                    Presenter: {room.presenter} · Location: {room.location}
                                </div>
                            </div>
                            <button
                                className={`ml-4 px-4 py-2 rounded font-bold
                                    ${canJoin
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-gray-500 text-gray-300 cursor-not-allowed"
                                    }`}
                                onClick={() => {
                                    if (canJoin) handleJoin(room);
                                }}
                                disabled={!canJoin}
                            >
                                {asHost ? "Enter as Presenter" : "Join as Viewer"}
                            </button>
                        </div>
                    );
                })}
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
