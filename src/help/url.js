export function getBackendUrl() {
    return (location.protocol !== 'https:') ? import.meta.env.VITE_BACKEND_URL : import.meta.env.VITE_BACKEND_SECURE_URL
}
export function getBackendWs() {
    return (location.protocol !== 'https:') ? import.meta.env.VITE_BACKEND_WS : import.meta.env.VITE_BACKEND_SECURE_WS
}