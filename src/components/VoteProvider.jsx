import { useEffect, useRef, useState } from "react";
import { useServerHealth } from "./ServerHealthContext";
import Cookies from "js-cookie";
import { getBackendUrl } from "../help/url";

export function VoteProvider() {
  const [rooms, setRooms] = useState([]);
  const [myVotes, setMyVotes] = useState({});
  const roomCheckInterval = useRef();
  const serverReachable = useServerHealth();

  const fetchUpdate = async (serverReachable) => {
    if (!serverReachable) {
      return;
    }

    // TODO: error handling?
    const res = await fetch(`${getBackendUrl()}/vote`, { method: "GET", cache: 'no-cache', headers: { "ngrok-skip-browser-warning": "true" } });
    const data = await res.json();

    setRooms(data);

    const myVotesClone = {}
    data.forEach(room => {
      myVotesClone[room.code] = getMyVote(room)
    });
    setMyVotes(myVotesClone)

  };

  function getMyVote(room) {
    const cookie = Cookies.get(`voted-${room.code}`);
    return cookie == "true";
  }

  useEffect(() => {
    fetchUpdate(serverReachable);
    roomCheckInterval.current = setInterval(fetchUpdate, 5000);
    return () => {
      clearInterval(roomCheckInterval.current);
    };
  }, [serverReachable]);

  async function handleVote(room, add) {
    var response;
    try {
      response = await fetch(`${getBackendUrl()}/vote/${room.code}/${add ? "add" : "remove"}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
    } catch (error) {
      addToast({
        title: "Failed to vote",
        message: `${error.name}: ${error.message}`,
        type: "error",
      });
    }

    if (response.ok) {
      const roomsClone = JSON.parse(JSON.stringify(rooms))
      for (let i = 0; i < roomsClone.length; i++) {
        if(roomsClone[i].code == room.code)
        {
          roomsClone[i].votes = await response.json()
          break;
        }
      }
      setRooms(roomsClone)
      if (!add)
        Cookies.remove(`voted-${room.code}`);
      else
        Cookies.set(`voted-${room.code}`, true);
      const myVotesClone = JSON.parse(JSON.stringify(myVotes))
      myVotesClone[room.code] = add;
      setMyVotes(myVotesClone)
    }

  }

  return { rooms, fetchUpdate, handleVote, myVotes };
}
