import { useNavigate } from "react-router-dom";
import { useServerHealth } from "../components/ServerHealthContext";
import { RoomsProvider } from "../components/RoomsProvider";
import { useToast } from "../components/ToastProvider";
import Spinner from "../components/Spinner";
import { useAuth } from "../components/AuthContext";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

export default function RoomListView({ role = 'client' }) {
    const { rooms, roomCapacityReached, fetchUpdate } = RoomsProvider();

    const { t } = useTranslation();

    const navigate = useNavigate();
    const serverReachable = useServerHealth();
    const { addToast } = useToast();

    const { isAuthenticated, authenticate, getPassword } = useAuth();

    function handleJoin(room) {
        if (role == 'client') {
            navigate(`/room/${room.id}/view`);
        } else {
            navigate(`/room/${room.id}/host`);
        }
    }

    function handleClose(room) {
        if (role != 'admin') {
            console.log('Insufficient permissions to close room');
            addToast({
                title: "Failed to close",
                message: 'Insufficient permissions to close room',
                type: "error",
            });
        }

        fetch(`${import.meta.env.VITE_BACKEND_URL}/room/${room.id}/close`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: getPassword() }),
        }).then((response) => {
            if (response.ok) {
                console.log('Closed room');
                fetchUpdate(serverReachable);
                umami.track('closed-room-admin');
            } else {
                umami.track('closed-room-admin-failed');
                addToast({
                    title: "Failed to close",
                    message: 'Internal server error',
                    type: "error",
                });
            }
        });
    }

    return (
        <div className="h-full flex flex-col p-4 text-white">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-4 select-none text-center">{t("page.room-list.title")}</h1>
            <hr className="h-px mb-4 text-gray-600 border-2 bg-gray-600" />

            {
                (rooms.length > 0) ? (
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4 max-h-[calc(100vh-250px)]">
                        {/* Scrollable Room List */}

                        {

                            rooms.map(room => {
                                const connectionId = Cookies.get('connection_id') || '';
                                let allowedIn = false;

                                if (role != 'client') {
                                    if (room.host_connection_id == '') {
                                        allowedIn = !roomCapacityReached; // Can only open new room if there's capacity for it
                                    } else {
                                        allowedIn = room.host_connection_id == connectionId;
                                    }
                                } else {
                                    allowedIn = room.host_connection_id != '';
                                }

                                const canJoin = serverReachable && allowedIn;
                                const canClose = serverReachable && role == 'admin' && room.host_connection_id != '';

                                return (
                                    <div key={room.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                                        <div>
                                            <div className="text-lg font-semibold">{room.title}</div>
                                            <div className="text-gray-300 text-sm">
                                                {t("page.room-list.list.presenter-label")}: {room.presenter} · {t("page.room-list.list.location-label")}: {room.location}
                                            </div>
                                        </div>
                                        <button
                                            className={`ml-4 px-4 py-2 rounded font-bold
                                            ${canClose ? "bg-red-600 hover:bg-red-700 text-white" : (
                                                    canJoin
                                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                        : "bg-gray-500 text-gray-300 cursor-not-allowed"
                                                )}`}
                                            onClick={() => {
                                                if (canClose) {
                                                    handleClose(room);
                                                } else if (canJoin) {
                                                    handleJoin(room);
                                                }
                                            }}
                                            disabled={!canJoin && role != 'admin'}
                                        >
                                            {canClose ? "Close room" : (role == 'client' ? "Join as Viewer" : "Enter as Presenter")}
                                        </button>
                                    </div>
                                );
                            })
                        }
                    </div>
                ) : (
                    <Spinner></Spinner>
                )
            }



            {/* Back Button */}
            <button
                className="mt-4 py-3 w-full rounded bg-gray-600 hover:bg-gray-700 font-bold"
                onClick={() => navigate("/")}
            >
                {t("page.room-list.back")}
            </button>
        </div>
    );
}
