import { useState, useEffect, useCallback } from "react";

const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Listen for fullscreenchange events to update state
  useEffect(() => {
    function onFullscreenChange() {
      const fsElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(!!fsElement);
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("MSFullscreenChange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("mozfullscreenchange", onFullscreenChange);
      document.removeEventListener("MSFullscreenChange", onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(
    (element) => {
      if (!element) return;

      if (isFullscreen) {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        // Enter fullscreen
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }

        // On mobile, toggle fullscreen mode if desired
        // (You might add additional mobile-specific logic here)
      }
    },
    [isFullscreen]
  );

  return { isFullscreen, toggleFullscreen, isMobile };
}
