import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import PasswordPopup from "../components/PasswordPopup";
import StatusLED from "../components/StatusLED";
import { useServerHealth } from "../components/ServerHealthContext";
import { RoomsProvider } from "../components/RoomProvider";
import { useTranslation } from "react-i18next";

export default function RoomCreateView({ onCreate, validPassword = "letmein" }) {
    const [roomName, setRoomName] = useState("");
    const [presenter, setPresenter] = useState("");
    const [language, setLanguage] = useState("en");
    const [showPopup, setShowPopup] = useState(true);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const serverReachable = useServerHealth();
    const { rooms } = RoomsProvider();

    const { t } = useTranslation();

    function handlePasswordSubmit() {
        if (password === validPassword) {
            setShowPopup(false);
            setError("");
        } else {
            setError("Invalid password.");
        }
    }

    function handleCreate() {
        if (roomName && presenter) {
            const newRoom = {
                id: nanoid(8),
                name: roomName,
                presenter,
                language
            };
            onCreate(newRoom);
            // navigation handled in App.jsx after onCreate
        }
    }

    return (
        <div>
            <StatusLED status={serverReachable} />
            <h2 className="text-2xl font-bold text-white mb-6 select-none">Create Room</h2>
            {showPopup && (
                <PasswordPopup
                    password={password}
                    setPassword={setPassword}
                    error={error}
                    onSubmit={handlePasswordSubmit}
                    onClose={() => navigate("/")}
                />
            )}
            {!showPopup && (
                <>
                    <input
                        className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-700 text-gray-100"
                        placeholder="Room Name"
                        value={roomName}
                        onChange={e => setRoomName(e.target.value)}
                    />
                    <input
                        className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-700 text-gray-100"
                        placeholder="Presenter Name"
                        value={presenter}
                        onChange={e => setPresenter(e.target.value)}
                    />
                    <select
                        className="w-full mb-6 px-4 py-2 rounded-lg bg-gray-700 text-gray-100"
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                    >
                        {rooms.map(room => (
                            <option key={room.id} value={`${room.id}`}>{room.name}</option>
                        ))}

                    </select>
                    <select
                        className="w-full mb-6 px-4 py-2 rounded-lg bg-gray-700 text-gray-100"
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                    >
                        <option value="en">English</option>
                        <option value="de">German</option>
                        <option value="fr">French</option>
                    </select>

                    <button
                        className={`w-full mb-2 py-3 rounded-lg font-bold text-lg
                                ${serverReachable
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-blue-900 text-gray-400 cursor-not-allowed"
                            }`}
                        onClick={handleCreate}
                        disabled={!serverReachable}
                    >
                        Create
                    </button>
                    <button
                        className="w-full py-2 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
                        onClick={() => navigate("/")}
                    >
                        Back
                    </button>
                </>
            )}
        </div>
    );
}
