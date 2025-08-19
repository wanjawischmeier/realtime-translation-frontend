import { useLocation } from "react-router-dom";

export function getBackendUrl() {
    const location = useLocation();

    return (location.protocol !== 'https:') ? import.meta.env.VITE_BACKEND_URL : import.meta.env.VITE_BACKEND_SECURE_URL
}
export function getBackendWs() {
    const location = useLocation();

    return (location.protocol !== 'https:') ? import.meta.env.VITE_BACKEND_WS : import.meta.env.VITE_BACKEND_SECURE_WS
}