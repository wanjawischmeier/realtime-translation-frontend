import { useEffect, useRef, useState } from "react";
import { useServerHealth } from "./ServerHealthContext";

export function RoomsProvider() {
  const [rooms, setRooms] = useState([]);
  const [availableSourceLangs, setAvailableSourceLangs] = useState([]);
  const [availableTargetLangs, setAvailableTargetLangs] = useState([]);
  const [maxActiveRooms, setMaxActiveRooms] = useState(0);
  const roomCheckInterval = useRef();
  const serverReachable = useServerHealth();

  const fetchUpdate = async (serverReachable) => {
    if (!serverReachable) {
      return;
    }

    // TODO: error handling?
    const res = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/room_list`, { method: "GET", cache: 'no-cache', headers: { "ngrok-skip-browser-warning": "true" }});
    const data = await res.json();
    console.log('Recieved room list:')
    console.log(data);

    setAvailableSourceLangs(data.available_source_langs);
    setAvailableTargetLangs(data.available_target_langs);
    setMaxActiveRooms(data.max_active_rooms);
    setRooms(data.rooms);
  };

  useEffect(() => {
    fetchUpdate(serverReachable);
    roomCheckInterval.current = setInterval(fetchUpdate, 5000);
    return () => {
      clearInterval(roomCheckInterval.current);
    };
  }, [serverReachable]);

  return {rooms, availableSourceLangs, availableTargetLangs, maxActiveRooms, fetchUpdate};
}
