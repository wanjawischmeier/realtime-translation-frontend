import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StatusLED from "../components/StatusLED";
import { useServerHealth } from "../components/ServerHealthContext";

export default function WhisperLiveKitViewer({ rooms }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = rooms.find(r => r.id === id);
  const [targetLang, setTargetLang] = useState("en");
  const serverReachable = useServerHealth();

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-white text-center">
          Room not found.
          <button
            className="mt-6 w-full py-2 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
            onClick={() => navigate("/rooms")}
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="relative bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-[1000px] flex flex-col items-stretch">
        <StatusLED status={serverReachable} />
        <div className="flex items-center mb-6">
          <div className="text-2xl font-bold text-white flex-1 select-none">{room.name}</div>
          <select
            className="ml-4 px-4 py-2 rounded-lg bg-gray-700 text-gray-100"
            value={targetLang}
            onChange={e => setTargetLang(e.target.value)}
          >
            <option value="en">English</option>
            <option value="de">German</option>
            <option value="fr">French</option>
            {/* Add more as needed */}
          </select>
        </div>
        <div
          className="w-full bg-gray-900 rounded-lg p-3 text-gray-100 text-base flex flex-col space-y-2 flex-1 overflow-y-auto"
          style={{ minHeight: 120 }}
        >
          {/* Render transcript here, just like in streamer, but no controls */}
          <span className="text-gray-500">Transcript will appear here...</span>
        </div>
        <button
          className="mt-8 w-full py-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
          onClick={() => navigate("/rooms")}
        >
          Back
        </button>
      </div>
    </div>
  );
}
