import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import StartView from "./views/StartView";
import RoomListView from "./views/RoomListView";
import RoomCreateView from "./views/RoomCreateView";
import WhisperLiveKitStreamer from "./views/WhisperLiveKitStreamer";
import WhisperLiveKitViewer from "./views/WhisperLiveKitViewer";
import { ServerHealthProvider } from "./components/ServerHealthContext";
import WebSocketViewer from "./views/WebSocketViewer";

// Initial example rooms
const initialRooms = [
  { id: "abc123", name: "Demo Room 1", presenter: "Alice", language: "en" },
  { id: "def456", name: "Workshop", presenter: "Bob", language: "de" }
];

export default function App() {
  const [rooms, setRooms] = useState(initialRooms);
  const [createdRoomIds, setCreatedRoomIds] = useState([]);

  return (
    <ServerHealthProvider wsUrl={"ws://localhost:8000/asr"}>
      <Router>
        <Routes>
          <Route path="/" element={<StartView />} />
          <Route path="/ws_debug" element={<WebSocketViewer />} />
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
      </Router>
    </ServerHealthProvider>
  );
}
