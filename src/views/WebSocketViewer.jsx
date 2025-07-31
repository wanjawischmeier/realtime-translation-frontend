import React, { useEffect, useRef, useState } from "react";
import StatusLED from "../components/StatusLED";
import { useServerHealth } from "../components/ServerHealthContext";

// Helper to format timestamps
function formatTime(t) {
    if (!t) return "";
    return t.replace(/^0:/, ""); // Remove leading 0 if present
}

export default function WebSocketViewer({ wsUrl }) {
    const [bubbles, setBubbles] = useState([]);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const serverReachable = useServerHealth();

    // Store the latest ASR and translation state
    const asrLinesRef = useRef([]); // all current lines from ASR
    const translationMapRef = useRef({}); // key: beg-end, value: translation

    // Helper to connect to the websocket
    const connectWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        wsRef.current = new WebSocket(`ws://${wsUrl}/asr`);

        wsRef.current.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "asr") {
                    // Save the full current lines array
                    asrLinesRef.current = msg.data.lines || [];
                    asrLinesRef.current.buffer = msg.data.buffer_transcription || "";
                }

                if (msg.type === "translation" && Array.isArray(msg.data)) {
                    // Build a mapping from beg-end to translation
                    const map = {};
                    msg.data.forEach(t => {
                        const key = `${t.beg}-${t.end}`;
                        map[key] = t.translation;
                    });
                    translationMapRef.current = map;
                }

                // Build bubbles from all current lines, or from translation if no lines yet
                let bubbles = [];
                if (asrLinesRef.current.length > 0) {
                    bubbles = asrLinesRef.current.map((line, idx) => {
                        const key = `${line.beg}-${line.end}`;
                        const translation = translationMapRef.current[key];
                        let status = "asr";
                        if (translation) status = "translated";
                        return {
                            beg: line.beg,
                            end: line.end,
                            speaker: line.speaker,
                            text: line.text,
                            translation,
                            status,
                            diff: line.diff,
                            buffer: (idx === asrLinesRef.current.length - 1) ? asrLinesRef.current.buffer : ""
                        };
                    });
                } else if (msg.type === "translation" && Array.isArray(msg.data)) {
                    // No ASR lines yet, but translation data present: build bubbles from translation
                    bubbles = msg.data.map((t, idx) => ({
                        beg: t.beg,
                        end: t.end,
                        speaker: t.speaker,
                        text: t.sentence,
                        translation: t.translation,
                        status: "translated",
                        diff: t.diff,
                        buffer: ""
                    }));
                }

                setBubbles(bubbles);

            } catch (e) {
                // Ignore parse errors for now
            }
        };

        wsRef.current.onopen = () => {
            console.log("WebSocket connected");
        };

        wsRef.current.onclose = () => {
            console.log("WebSocket disconnected");
            if (serverReachable) {
                reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
            }
        };
    };

    useEffect(() => {
        if (serverReachable) {
            connectWebSocket();
        } else {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        }
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
        <div>
            <StatusLED status={serverReachable} />

            <h1 className="text-2xl text-white font-bold mb-8">Transcript</h1>
            <div className="bg-gray-900 rounded shadow p-4 h-96 overflow-y-auto space-y-2">
                {bubbles.length === 0 ? (
                    <div className="text-gray-400">Waiting for transcript...</div>
                ) : (
                    bubbles.map((bubble, idx) => (
                        <div
                            key={idx}
                            className={`rounded-lg px-4 py-2 mb-2 max-w-[80%] 
                                ${bubble.status === "translated"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-800 text-gray-300"
                                }`}
                        >
                            <div className="flex items-center mb-1">
                                <span className="text-xs text-gray-400 mr-2">{formatTime(bubble.beg)} - {formatTime(bubble.end)}</span>
                                <span className="text-xs text-gray-400">Speaker {bubble.speaker}</span>
                            </div>
                            <div className="text-base font-medium">
                                {bubble.translation ? (
                                    <span>{bubble.translation}</span>
                                ) : (
                                    <span className={bubble.status === "asr" ? "text-gray-400" : ""}>
                                        {bubble.text}
                                    </span>
                                )}
                                {bubble.buffer && (
                                    <span className="text-gray-500 font-mono ml-2">{bubble.buffer}</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
