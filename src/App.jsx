import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import StartView from "./views/StartView";
import RoomListView from "./views/RoomListView";
import TranscriptListView from "./views/TranscriptListView";
import WhisperLiveKitStreamer from "./views/WhisperLiveKitStreamer";
import WhisperLiveKitViewer from "./views/WhisperLiveKitViewer";
import { ServerHealthProvider } from "./components/ServerHealthContext";
import { AuthProvider } from "./components/AuthContext";
import HeaderHandler from "./components/HeaderHandler";
import AuthGuard from "./components/AuthGuard"
import RoomSetupGuard from "./components/RoomSetupGuard"
import ToastProvider from "./components/ToastProvider"
import HelpView from "./views/HelpView";
import LocalizationSelect from "./components/LocalizationSelect";
import ProjectLinks from "./components/ProjectLinks";


export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ServerHealthProvider>
          <Router>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 svg-bg">
              <div className="relative bg-gray-800 shadow-lg w-full min-h-screen sm:min-h-[600px] sm:rounded-xl sm:w-[600px] p-4">
                <HeaderHandler />
                <ProjectLinks />
                <LocalizationSelect />
                <Routes>
                  <Route path="/" element={<StartView />} />
                  <Route path="*" element={<Navigate to="/" />} />
                  <Route path="/rooms" element={<RoomListView />} />
                  <Route path="/transcripts" element={<TranscriptListView />} />
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
                      <AuthGuard needAdmin={true}>
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
      </AuthProvider>
    </ToastProvider>
  );
}
