import { useEffect, useRef, useState } from "react";

export function RoomsProvider() {
  const [rooms, setRooms] = useState([
        { id: "abc123", name: "Demo Room 1", presenter: "Alice", language: "en", isActive: true },
        { id: "dev_room_id", name: "Workshop", presenter: "Bob", language: "de", isActive: false }
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
  }, []);

  return {rooms,fetchUpdate};
}