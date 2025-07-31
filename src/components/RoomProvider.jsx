import { useEffect, useRef, useState } from "react";

export function RoomsProvider(wsUrl) {
  const [rooms, setRooms] = useState([
        { id: "abc123", name: "Demo Room 1", presenter: "Alice", language: "en" },
        { id: "def456", name: "Workshop", presenter: "Bob", language: "de" }
      ]);
  const roomCheckInterval = useRef();

  const fetchUpdate = async () => {
    try {
      // Todo: Parse
      //const res = await fetch(`${wsUrl}/rooms`, { method: "GET", cache: 'no-cache', headers: { "ngrok-skip-browser-warning": "true" }});
      //setRooms();

    } catch {
      // Todo Handle
    }
  };

  useEffect(() => {
    fetchUpdate();
    roomCheckInterval.current = setInterval(fetchUpdate, 5000);
    return () => {
      clearInterval(roomCheckInterval.current);
    };
  }, [wsUrl]);

  return {rooms,fetchUpdate};
}