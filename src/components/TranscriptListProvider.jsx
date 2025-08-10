import { useEffect, useRef, useState } from "react";
import { useServerHealth } from "./ServerHealthContext";

export function TranscriptListProvider(wsUrl) {
  const [availableTranscriptInfos, setAvailableTranscriptInfos] = useState([]);
  const CheckInterval = useRef();
  const serverReachable = useServerHealth();

  const fetchUpdate = async (wsUrl, serverReachable) => {
    if (!serverReachable) {
      return;
    }

    // TODO: error handling?
    const res = await fetch(`http://${wsUrl}/transcript_list`, { method: "GET", cache: 'no-cache', headers: { "ngrok-skip-browser-warning": "true" }});
    const data = await res.json();
    console.log('Recieved available transcript list:')
    console.log(data);

    setAvailableTranscriptInfos(data);
  };

  useEffect(() => {
    fetchUpdate(wsUrl, serverReachable);
    CheckInterval.current = setInterval(fetchUpdate, 5000);
    return () => {
      clearInterval(CheckInterval.current);
    };
  }, [serverReachable]);

  return {availableTranscriptInfos, fetchUpdate};
}
