import { createContext, useContext, useEffect, useRef, useState } from "react";

const ServerHealthContext = createContext();

export function ServerHealthProvider({ children }) {
  const [serverReachable, setServerReachable] = useState(false);
  const healthCheckInterval = useRef();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/health`, { method: "GET", cache: 'no-cache', headers: { "ngrok-skip-browser-warning": "true" }});
        setServerReachable(res.ok);

      } catch {
        setServerReachable(false);
      }
    };

    checkHealth();
    healthCheckInterval.current = setInterval(checkHealth, 5000);
    return () => {
      clearInterval(healthCheckInterval.current);
    };
  });

  return (
    <ServerHealthContext.Provider value={serverReachable}>
      {children}
    </ServerHealthContext.Provider>
  );
}

export function useServerHealth() {
  return useContext(ServerHealthContext);
}
