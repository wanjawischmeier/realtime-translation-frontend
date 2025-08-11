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
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 select-none">Available Rooms</h2>
            <ul className="mb-6">
                {rooms.map(room => {
                    const connectionId = Cookies.get('connection_id') || '';
                    var allowedIn = false;
                    if (asHost) {
                        // TODO: only allow if max active connections not exceeded
                        if (room.host_connection_id) {
                            // Host already connected, only allowed if we are that host
                            allowedIn = room.host_connection_id == connectionId;
                        } else {
                            // No host connected
                            allowedIn = true;
                        }
                    } else {
                        // Can join all rooms that already have a host as a client
                        allowedIn = room.host_connection_id != '';
                    }
                    const canJoin = allowedIn && serverReachable;

                    return (
                        <li key={room.id} className="mb-4">
                            <div className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                                <div>
                                    <div className="text-lg font-semibold text-white">{room.title}</div>
                                    <div className="text-gray-300 text-sm">Presenter: {room.presenter} · Location: {room.location}</div>
                                </div>
                                <button
                                    className={`ml-4 px-4 py-2 rounded font-bold
                                        ${canJoin
                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                            : "bg-gray-500 text-gray-300 cursor-not-allowed"
                                        }`}
                                    onClick={() => {
                                        if (canJoin) {
                                            handleJoin(room);
                                        }
                                    }}
                                    disabled={!canJoin}
                                >
                                    {asHost ? "Enter as Presenter" : "Join as Viewer"}
                                </button>
                            </div>
                        </li>
                    )
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
