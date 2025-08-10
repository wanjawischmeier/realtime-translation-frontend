import { useRef, useEffect, useState } from 'react';
import { useToast } from "./ToastProvider";

const WebSocketHandler = ({ wsUrl, onMessage, onOpen = () => { }, onClose = () => { }, onError = (code, message) => { }, serverReachable, isHost }) => {
    const wsRef = useRef(null);
    const [wsConnected, setWsConnected] = useState(false);
    const reconnectTimeoutRef = useRef(null);
    const currentWsUrlRef = useRef(null);
    const { addToast } = useToast();

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
    }, [serverReachable, wsUrl]);


    const connectWebSocket = async () => {
        const connectUrl = wsUrl;

        if (connectUrl == undefined)
            return;

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        console.log(`Connecting to ${connectUrl}`)
        const startTime = Date.now();
        wsRef.current = new WebSocket(connectUrl);

        wsRef.current.onopen = () => {
            const delayMs = Date.now() - startTime;
            setWsConnected(true)
            console.log(`WebSocket running on: ${connectUrl} (took ${delayMs}ms)`);
            addToast({ // TODO: Remove debugging toast
                title: "Websocket connection opened",
                message: `WebSocket now running on: ${connectUrl}`,
                type: "info",
            });

            if (delayMs < 1000) {
                umami.track(`${isHost ? 'host' : 'client'}-joined`);
            } else {
                umami.track(`${isHost ? 'host' : 'client'}-joined-slow`, { delay: delayMs });
            }

            onOpen()
        };

        wsRef.current.onclose = (e) => {
            onClose();
            console.log(`WebSocket closed ${e.wasClean ? "clean" : "not clean"} with code ${e.code}`);
            if (e.wasClean) {
                umami.track(`${isHost ? 'host' : 'client'}-disconnected`, { code: e.code, reason: e.reason });
            } else {
                umami.track(`${isHost ? 'host' : 'client'}-disconnected-unexpected`, { code: e.code, reason: e.reason });
                onError(e.code, e.reason);
            }

            if (e.code == 1003) {
                // Backend error message available
                onError(e.code, e.reason);
                addToast({
                    title: "Websocket connection closed",
                    message: e.reason,
                    type: "error",
                });
            } else {
                addToast({
                    title: "Websocket connection closed",
                    message: `Error ${e.code}, disconnect was${e.wasClean ? " " : " not "}clean\n${e.reason}`,
                    type: "error",
                });
            }

            setWsConnected(false)
            if (serverReachable && connectUrl == currentWsUrlRef.current) {
                reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
            }
        };

        wsRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
            umami.track(`${isHost ? 'host' : 'client'}-disconnected-error`, { code: error.code, message: error.message });
            onError(error.code, error.message);
            addToast({
                title: "Websocket connection error",
                message: `Error ${error.code}:\n${error.message}`,
                type: "error",
            });
        };

        wsRef.current.onmessage = (event) => {
            onMessage(event)
        };
    };

    const wsSend = (data) => {
        wsRef.current.send(data);
    }

    const sendRestartBackendSignal = () => {
        if (!wsRef.current) {
            return;
        }

        let data = JSON.stringify({
            'signal': 'restart_backend_engine'
        });
        wsRef.current.send(data);
    }

    return { wsSend, wsConnected, sendRestartBackendSignal };
};

export default WebSocketHandler;