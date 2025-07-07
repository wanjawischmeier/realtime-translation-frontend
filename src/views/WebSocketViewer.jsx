import React, { useEffect, useRef, useState } from "react";
import StatusLED from "../components/StatusLED";
import { useServerHealth } from "../components/ServerHealthContext";

export default function WebSocketViewer() {
    const [messages, setMessages] = useState([]);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const serverReachable = useServerHealth();

    // Helper to connect to the websocket
    const connectWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        wsRef.current = new WebSocket("ws://localhost:8000/ws");

        wsRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setMessages((prev) => [...prev, data]);
            } catch (e) {
                setMessages((prev) => [...prev, { error: "Invalid JSON", raw: event.data }]);
            }
        };

        wsRef.current.onopen = () => {
            console.log("WebSocket connected");
        };

        wsRef.current.onclose = () => {
            console.log("WebSocket disconnected");
            // If server is still reachable, try to reconnect after a delay
            if (serverReachable) {
                reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
            }
        };
    };

    useEffect(() => {
        if (serverReachable) {
            connectWebSocket();
        } else {
            // If server becomes unreachable, close the socket
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        }
        // Cleanup on unmount or when serverReachable changes
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [serverReachable]);

    return (
        <div className="max-w-2xl mx-auto mt-8">
            <StatusLED status={serverReachable} />
            <h1 className="text-2xl font-bold mb-4">WebSocket Incoming Data</h1>
            <div className="bg-gray-100 rounded shadow p-4 h-96 overflow-y-auto space-y-2">
                {messages.length === 0 ? (
                    <div className="text-gray-500">Waiting for messages...</div>
                ) : (
                    messages.map((msg, idx) => (
                        <pre
                            key={idx}
                            className={`text-xs p-2 rounded ${msg.type === "translation"
                                ? "bg-green-100"
                                : msg.type === "asr"
                                    ? "bg-blue-100"
                                    : "bg-red-100"
                                }`}
                        >
                            {JSON.stringify(msg, null, 2)}
                        </pre>
                    ))
                )}
            </div>
        </div>
    );
}
