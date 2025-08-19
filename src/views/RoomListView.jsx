import { useNavigate } from "react-router-dom";
import { useServerHealth } from "../components/ServerHealthContext";
import { RoomsProvider } from "../components/RoomsProvider";
import { useToast } from "../components/ToastProvider";
import Spinner from "../components/Spinner";
import { useAuth } from "../components/AuthContext";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import trackUmami from "../help/umamiHelper";
import RoomStatus from "../components/RoomStatus";
import { useEffect } from "react";
import { getBackendUrl } from "../help/url";

export default function RoomListView({ role = 'client' }) {
    const { rooms, roomCapacityReached, fetchUpdate } = RoomsProvider();

    const { t } = useTranslation();

    const navigate = useNavigate();
    const serverReachable = useServerHealth();
    const { addToast } = useToast();

    const { getKey } = useAuth();

    useEffect(() => { document.title = t("page.room-list.title") + " - " + t('dom-title') });

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

        fetch(`${getBackendUrl()}/room/${room.id}/close`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ key: getKey() }),
        }).then((response) => {
            if (response.ok) {
                console.log('Closed room');
                fetchUpdate(serverReachable);
                trackUmami('closed-room-admin');
            } else {
                trackUmami('closed-room-admin-failed');
                addToast({
                    title: "Failed to close",
                    message: 'Internal server error',
                    type: "error",
                });
            }
        });
    }

    return (
        <div className="h-full flex flex-col p-4 text-white w-full">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-4 select-none text-center">{t("page.room-list.title")}</h1>
            <hr className="h-px mb-4 text-gray-600 border-2 bg-gray-600" />

            {
                (rooms.length > 0) ? (
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4 max-h-[calc(100vh-250px)]">
                        {/* Scrollable Room List */}

                        {
                            rooms.sort((a, b) => (((a.host_connection_id != '' ? 2 : 0) - (b.host_connection_id != '' ? 2 : 0)) + a.location.localeCompare(b.location))).map(room => {
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

                                const isRoomAlive = room.host_connection_id != '';
                                const canJoin = serverReachable && allowedIn;
                                const isAdmin = serverReachable && role == 'admin';
                                const canClose = isAdmin && room.host_connection_id != '';

                                return (
                                    <div key={room.id} className="flex bg-gray-700 rounded-lg overflow-hidden">
                                        {/* Color strip */}
                                        <div
                                            className="w-4 flex-shrink-0"
                                            style={{ backgroundColor: room.track.color }}
                                        ></div>

                                        {/* Card content */}
                                        <div className="flex flex-col justify-end items-end p-4 flex-grow">
                                            <div className="w-full">
                                                <div className="text-lg font-semibold">{room.title}</div>
                                                <div className="text-gray-300 text-sm">
                                                    {t("page.room-list.list.presenter-label")}: {
                                                        room.presenter === "Unknown"
                                                            ? t("page.room-list.list.unknown-presenter-name")
                                                            : room.presenter
                                                    } · {t("page.room-list.list.location-label")
                                                    }: {room.location}
                                                </div>
                                                <div className="flex justify-start mt-2 gap-3 items-center">
                                                    <RoomStatus
                                                        status={isRoomAlive}
                                                        label={t("page.room-list.list.activity.label")}
                                                        labelActive={t("page.room-list.list.activity.on")}
                                                        labelInActive={t("page.room-list.list.activity.off")}
                                                    />
                                                    {(isRoomAlive && (
                                                        <div className="flex justify-start items-center">
                                                            <div className="text-gray-100 text-sm mr-1">
                                                                {t("page.room-list.list.owner.label")}:
                                                            </div>
                                                            <div className={`text-gray-200 font-bold text-sm`}>
                                                                {room.host_connection_id == connectionId
                                                                    ? t("page.room-list.list.owner.you")
                                                                    : room.host_connection_id.substring(0, 3) + "..."}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                className={`px-4 py-2 rounded font-bold
                                                    ${isAdmin
                                                        ? canClose
                                                            ? "bg-red-600 hover:bg-red-700 text-white"
                                                            : "bg-gray-500 text-gray-300 cursor-not-allowed"
                                                        : canJoin
                                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                            : "bg-gray-500 text-gray-300 cursor-not-allowed"
                                                    }`}
                                                onClick={() => {
                                                    if (canClose) {
                                                        handleClose(room);
                                                    } else if (canJoin) {
                                                        handleJoin(room);
                                                    }
                                                }}
                                                disabled={!canJoin && role != "admin"}
                                            >
                                                {isAdmin ? "Close room" : role == "client" ? t("page.startpage.join-viewer") : t("page.startpage.join-host")}
                                            </button>
                                        </div>
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
