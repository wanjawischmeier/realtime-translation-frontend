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
import HelpView from "./views/HelpView";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ServerHealthProvider wsUrl={import.meta.env.VITE_BACKEND_URL}>
          <Router>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-300">
              <div className="relative bg-gray-800 shadow-lg w-full sm:w-auto min-h-screen sm:min-h-[600px] sm:rounded-xl sm:min-w-[600px] p-4">
                <HeaderHandler />
                <Routes>
                  <Route path="/" element={<StartView />} />
                  <Route path="/ws_debug" element={<WebSocketViewer wsUrl={import.meta.env.VITE_BACKEND_URL} />} />
                  <Route path="/rooms" element={<RoomListView />} />
                  <Route path="/transcripts" element={<TranscriptListView wsUrl={import.meta.env.VITE_BACKEND_URL} />} />
                  <Route
                    path="/rooms/host"
                    element={
                      <AuthGuard>
                        <RoomListView role={'host'} />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/rooms/admin"
                    element={
                      <AuthGuard>
                        <RoomListView role={'admin'} />
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
                  <Route path="/help" element={<HelpView />} />
                </Routes>
              </div>
            </div>
          </Router>
        </ServerHealthProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
