import { useEffect, useRef, useState } from "react";
import { useServerHealth } from "./ServerHealthContext";

export function TranscriptListProvider() {
  const [availableTranscriptInfos, setAvailableTranscriptInfos] = useState([]);
  const CheckInterval = useRef();
  const serverReachable = useServerHealth();

  const fetchUpdate = async (serverReachable) => {
    if (!serverReachable) {
      return;
    }

    // TODO: error handling?
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/transcript_list`, { method: "GET", cache: 'no-cache', headers: { "ngrok-skip-browser-warning": "true" }});
    const data = await res.json();
    console.log(data);
    console.log('Recieved available transcript list:')
    console.log(data);

    setAvailableTranscriptInfos(data);
  };

  useEffect(() => {
    fetchUpdate(serverReachable);
    CheckInterval.current = setInterval(fetchUpdate, 5000);
    return () => {
      clearInterval(CheckInterval.current);
    };
  }, [serverReachable]);

  return {availableTranscriptInfos, fetchUpdate};
}
