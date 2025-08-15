import HealthStatusLED from "./HealthStatusLED"
import { useServerHealth } from "./ServerHealthContext";

export default function HeaderHandler() {
  const serverReachable = useServerHealth();

  return (
    <HealthStatusLED status={serverReachable} />
  );
}