import React from "react"
import StatusLED from "./StatusLED"
import { useServerHealth } from "./ServerHealthContext";

export default function HeaderHandler() {
  const serverReachable = useServerHealth();

  return (
    
    <StatusLED status={serverReachable} />
  );
}