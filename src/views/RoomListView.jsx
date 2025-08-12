import { useNavigate } from "react-router-dom";
import { useServerHealth } from "../components/ServerHealthContext";
import { RoomsProvider } from "../components/RoomsProvider";
import { useToast } from "../components/ToastProvider";
import Cookies from "js-cookie";

export default function RoomListView({ role = 'client' }) {
    const { rooms, roomCapacityReached, fetchUpdate } = RoomsProvider();

    const navigate = useNavigate();
    const serverReachable = useServerHealth();
    const { addToast } = useToast();

    const password = Cookies.get("authenticated");

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

        fetch(`http://${import.meta.env.VITE_BACKEND_URL}/room/${room.id}/close`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
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
        <div className="h-full flex flex-col p-4 bg-gray-800 text-white">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-4 select-none text-center">Available rooms</h1>
            <hr className="h-px mb-4 text-gray-600 border-2 bg-gray-600" />

            {/* Scrollable Room List */}
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 max-h-[calc(100vh-250px)]">
                {
                    (rooms.length > 0) ?
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
                                            Presenter: {room.presenter} · Location: {room.location}
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
                        }) : (
                            <div className="flex-grow flex justify-center items-center m-8">
                                {/* https://flowbite.com/docs/components/spinner */}
                                <div role="status">
                                    <svg
                                        aria-hidden="true"
                                        className="w-16 h-16 animate-spin text-gray-700 fill-blue-700"
                                        viewBox="0 0 100 101"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentFill"
                                        />
                                    </svg>
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        )}
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
