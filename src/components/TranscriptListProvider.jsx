import { useEffect, useRef, useState } from "react";
import { useServerHealth } from "./ServerHealthContext";
import { useAuth } from "./AuthContext";

export function TranscriptListProvider() {
    const [availableTranscriptInfos, setAvailableTranscriptInfos] = useState([]);
    const CheckInterval = useRef();
    const serverReachable = useServerHealth();
    const { getKey } = useAuth();

    const fetchUpdate = async (serverReachable) => {
        if (!serverReachable) {
            return;
        }

        // TODO: error handling?
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/transcript_list`, {
            method: "POST",
            cache: 'no-cache',
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true", // TODO: remove ngrok workaround in production
            },
            body: JSON.stringify({ key: getKey() }),
        });
        const data = await response.json();
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

    return { availableTranscriptInfos, fetchUpdate };
}
