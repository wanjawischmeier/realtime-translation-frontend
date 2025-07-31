// WebSocketHandler.js
import React, { useRef, useEffect, useState } from 'react';

const WebSocketHandler = ({ wsUrl, onMessage, onOpen=()=>{}, onClose=()=>{}, serverReachable }) => {
    const wsRef = useRef(null);
    const [wsConnected, setWsConnected] = useState(false);
    const reconnectTimeoutRef = useRef(null);

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

    const connectWebSocket = async () => {
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            setWsConnected(true)
            onOpen()
        };

        wsRef.current.onclose = () => {
            onClose()
            setWsConnected(false)
            if (serverReachable) {
                reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
            }
        };

        wsRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
            alert("An error occurred with the WebSocket connection.");
        };

        wsRef.current.onmessage = (event) => {
            onMessage(event)
        };
    };

    const wsSend = (data) => {
        wsRef.current.send(data);
    }

    return {
        wsSend: wsSend,
        wsConnected: wsConnected
    };
};

export default WebSocketHandler;