// WebSocketHandler.js
import React, { useRef, useEffect, useState } from 'react';

const WebSocketHandler = ({ wsUrl, onMessage, onOpen = () => { }, onClose = () => { }, serverReachable }) => {
    const wsRef = useRef(null);
    const [wsConnected, setWsConnected] = useState(false);
    const reconnectTimeoutRef = useRef(null);
    const currentWsUrlRef = useRef(null);

    useEffect(() => {
        currentWsUrlRef.current = wsUrl
        if (serverReachable && wsUrl) {
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
    }, [serverReachable,wsUrl]);


    const connectWebSocket = async () => {

        const connectUrl = wsUrl;

        if(connectUrl == undefined)
            return;

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        console.log(`Connecting to ${connectUrl}`)

        wsRef.current = new WebSocket(connectUrl);

        wsRef.current.onopen = () => {
            setWsConnected(true)
            console.log("WebSocket running on: ", connectUrl);
            onOpen()
        };

        wsRef.current.onclose = (e) => {
            onClose()
            console.log(`WebSocket closed ${e.wasClean ? "clean" : "not clean"} with code ${e.code}`);
            setWsConnected(false)
            if (serverReachable && connectUrl == currentWsUrlRef.current) {
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