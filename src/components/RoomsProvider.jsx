import { useEffect, useRef, useState } from "react";
import { useServerHealth } from "./ServerHealthContext";

export function RoomsProvider(wsUrl) {
  const [rooms, setRooms] = useState([]);
  const roomCheckInterval = useRef();
  const serverReachable = useServerHealth();

  const fetchUpdate = async (wsUrl, serverReachable) => {
    if (!serverReachable) {
      return;
    }

    // TODO: error handling?
    const res = await fetch(`http://${wsUrl}/room_list`, { method: "GET", cache: 'no-cache', headers: { "ngrok-skip-browser-warning": "true" }});
    const data = await res.json();
    console.log(data);
    setRooms(data);
  };

  useEffect(() => {
    fetchUpdate(wsUrl, serverReachable);
    roomCheckInterval.current = setInterval(fetchUpdate, 5000);
    return () => {
      clearInterval(roomCheckInterval.current);
    };
  }, [serverReachable]);

  return {rooms,fetchUpdate};
}
// Host: active && host or inactive && client 