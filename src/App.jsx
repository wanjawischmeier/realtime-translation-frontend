import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartView from "./views/StartView";
import RoomListView from "./views/RoomListView";
import TranscriptListView from "./views/TranscriptListView";
import WhisperLiveKitStreamer from "./views/WhisperLiveKitStreamer";
import WhisperLiveKitViewer from "./views/WhisperLiveKitViewer";
import { ServerHealthProvider } from "./components/ServerHealthContext";
import WebSocketViewer from "./views/WebSocketViewer";
import { AuthProvider } from "./components/AuthContext";
import HeaderHandler from "./components/HeaderHandler";
import AuthGuard from "./components/AuthGuard"
import RoomSetupGuard from "./components/RoomSetupGuard"
import ToastProvider from "./components/ToastProvider"

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ServerHealthProvider wsUrl={import.meta.env.VITE_BACKEND_URL}>
          <Router>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-300">
              <div className="relative bg-gray-800 rounded-none shadow-lg sm:min-w-150 p-2 sm:p-4 pt-15 w-full min-h-screen sm:min-h-100 sm:w-auto sm:rounded-xl">
                <HeaderHandler></HeaderHandler>
                <Routes>
                  <Route path="/" element={<StartView />} />
                  <Route path="/ws_debug" element={<WebSocketViewer wsUrl={import.meta.env.VITE_BACKEND_URL} />} />
                  <Route path="/rooms" element={<RoomListView />} />
                  <Route path="/transcripts" element={<TranscriptListView wsUrl={import.meta.env.VITE_BACKEND_URL} />} />
                  <Route
                    path="/rooms/host"
                    element={
                      <AuthGuard>
                        <RoomListView asHost={true} />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/room/:room_id/host"
                    element={
                      <AuthGuard>
                        <RoomSetupGuard>
                          <WhisperLiveKitStreamer />
                        </RoomSetupGuard>
                      </AuthGuard>
                    }
                  />
                  <Route path="/room/:room_id/view" element={<WhisperLiveKitViewer />} />
                </Routes>
              </div>
            </div>
          </Router>
        </ServerHealthProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
