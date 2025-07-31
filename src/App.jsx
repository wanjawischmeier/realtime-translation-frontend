import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import StartView from "./views/StartView";
import RoomListView from "./views/RoomListView";
import RoomCreateView from "./views/RoomCreateView";
import WhisperLiveKitStreamer from "./views/WhisperLiveKitStreamer";
import WhisperLiveKitViewer from "./views/WhisperLiveKitViewer";
import { ServerHealthProvider, useServerHealth } from "./components/ServerHealthContext";
import WebSocketViewer from "./views/WebSocketViewer";
import StatusLED from "./components/StatusLED";

// Initial example rooms
const initialRooms = [
  { id: "abc123", name: "Demo Room 1", presenter: "Alice", language: "en" },
  { id: "def456", name: "Workshop", presenter: "Bob", language: "de" }
];

const backendUrl = "http://localhost:8000";

export default function App() {
  const [rooms, setRooms] = useState(initialRooms);
  
  const [createdRoomIds, setCreatedRoomIds] = useState([]);
  return (
    <ServerHealthProvider wsUrl={backendUrl}>
      <Router>
        <StatusLED status={() => {
          return useServerHealth()
        }} />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-300">
          <div className="relative bg-gray-800 rounded-none shadow-lg p-2 sm:p-4 pt-15 w-full min-h-screen sm:min-h-100 sm:w-auto sm:rounded-xl">
            <Routes>
              <Route path="/" element={<StartView />} />
              <Route path="/ws_debug" element={<WebSocketViewer wsUrl={"localhost:8000"} />} />
              <Route
                path="/rooms"
                element={
                  <RoomListView
                    rooms={rooms}
                    createdRoomIds={createdRoomIds}
                    onJoin={room => {
                      // logic will be in RoomListView
                    }}
                  />
                }
              />
              <Route
                path="/create"
                element={
                  <RoomCreateView
                    onCreate={room => {
                      setRooms(prev => [...prev, room]);
                      setCreatedRoomIds(prev => [...prev, room.id]);
                      // navigate to stream
                      window.location.href = `/room/${room.id}/stream`;
                    }}
                  />
                }
              />
              <Route path="/room/:id/stream" element={<WhisperLiveKitStreamer rooms={rooms} />} />
              <Route path="/room/:id/view" element={<WhisperLiveKitViewer rooms={rooms} />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ServerHealthProvider>
  );
}
