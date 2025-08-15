export default function HealthStatusLED({ status }) {
  var color;
  if (import.meta.env.VITE_SERVER_MAINTENANCE) {
    color = "bg-orange-500";
  } else {
    color = status ? "bg-green-500" : "bg-red-500";
  }

  return (
    <span className="absolute top-4 right-4 flex items-center z-20">
      <span className="relative flex h-3 w-3 mr-1">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
      </span>
    </span>
  );
}