import { useWakeLock } from 'react-screen-wake-lock';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StartView from "./views/StartView";
import RoomListView from "./views/RoomListView";
import TranscriptListView from "./views/TranscriptListView";
import WhisperLiveKitStreamer from "./views/WhisperLiveKitStreamer";
import WhisperLiveKitViewer from "./views/WhisperLiveKitViewer";
import { ServerHealthProvider } from "./components/ServerHealthContext";
import { AuthProvider } from "./components/AuthContext";
import HeaderHandler from "./components/HeaderHandler";
import AuthGuard from "./components/AuthGuard";
import RoomSetupGuard from "./components/RoomSetupGuard";
import ToastProvider from "./components/ToastProvider";
import HelpView from "./views/HelpView";
import RoomVoting from "./views/RoomVoting";
import LocalizationSelect from "./components/LocalizationSelect";
import ProjectLinks from "./components/ProjectLinks";

export default function App() {
  const { t } = useTranslation();
  const { isSupported, request } = useWakeLock({
    onRequest: () => console.log('Screen Wake Lock: requested!'),
    onError: () => console.log('Screen wake lock: An error happened'),
    onRelease: () => console.log('Screen Wake Lock: released!'),
    reacquireOnPageVisible: true,
  });

  if (isSupported) {
    request();
  } else {
    console.log('Screen wake lock: not supported');
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <ServerHealthProvider>
          <Router>
            <div className="flex flex-col h-[calc(100dvh)] bg-gray-900 svg-bg">
              <div className="flex-grow w-full h-[calc(100dvh-80px)]">
                <div className="flex flex-col justify-center items-center w-full h-full sm:pt-4">
                  <div className="flex justify-center relative bg-gray-800 shadow-lg w-full h-full sm:h-[600px] sm:rounded-xl sm:w-[600px] p-4">
                    <HeaderHandler />
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
                        path="/rooms/vote"
                        element={
                          <RoomVoting/>
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
              </div>
              <div className="flex justify-between items-center w-full h-20 p-4">
                <ProjectLinks />
                <LocalizationSelect />
              </div>
            </div>
          </Router>
        </ServerHealthProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
