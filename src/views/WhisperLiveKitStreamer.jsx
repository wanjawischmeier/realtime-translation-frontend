import { useRef, useState, useEffect } from "react";
import StatusLED from "../components/StatusLED";
import { useServerHealth } from "../components/ServerHealthContext";

function formatTime(t) {
  // Accepts "0:00:03" or similar, returns "00:03"
  if (!t) return "";
  const parts = t.split(":");
  return parts.length === 3 ? `${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}` : t;
}

function WhisperLiveKitStreamer() {
  const [wsUrl, setWsUrl] = useState("ws://localhost:8000/asr");
  const [streaming, setStreaming] = useState(false);
  const [lines, setLines] = useState([]); // Each line: {speaker, text, beg, end}
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const micStreamRef = useRef(null);
  const scrollRef = useRef(null);
  const serverReachable = useServerHealth();

  // Auto-scroll to bottom when lines change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const startStreaming = async () => {
    setLines([]);
    if (!serverReachable) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStreamRef.current = stream;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus"
      });
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0 && wsRef.current.readyState === 1) {
          wsRef.current.send(e.data);
        }
      };
      mediaRecorderRef.current.start(250);
      setStreaming(true);
    };

    wsRef.current.onclose = () => {
      setStreaming(false);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      // Stop mic stream if open
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
    };

    wsRef.current.onerror = () => {
      setStreaming(false);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      // Only add new lines, ignore buffer_transcription
      if (Array.isArray(data.lines)) {
        setLines(prevLines => {
          // Avoid duplicates by checking beg+end+speaker+text
          const newLines = [];
          for (const line of data.lines) {
            if (!prevLines.some(
              l => l.beg === line.beg && l.end === line.end && l.speaker === line.speaker && l.text === line.text
            )) {
              newLines.push(line);
            }
          }
          return [...prevLines, ...newLines];
        });
      }
    };
  };

  const stopStreaming = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    setStreaming(false);
  };

  const handleButtonClick = () => {
    if (streaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  // Group lines by speaker for chat bubbles
  const groupedLines = [];
  let lastSpeaker = null;
  let lastLines = [];
  lines.forEach((line, idx) => {
    if (line.speaker !== lastSpeaker) {
      if (lastLines.length) groupedLines.push({ speaker: lastSpeaker, lines: lastLines });
      lastSpeaker = line.speaker;
      lastLines = [line];
    } else {
      lastLines.push(line);
    }
  });
  if (lastLines.length) groupedLines.push({ speaker: lastSpeaker, lines: lastLines });

  return (
    <div
      className="relative bg-gray-800 rounded-xl shadow-lg flex flex-col w-full max-w-[1000px] h-[600px] mx-auto"
      style={{ padding: 32 }}
    >
      {/* Title at top left */}
      <div className="absolute top-8 left-8 text-2xl font-bold text-white pointer-events-none select-none">
        SSC Übersetzer
      </div>
      <StatusLED status={serverReachable} />

      {/* Spacer for title */}
      <div className="h-10" />

      {/* URL input and button on one line */}
      <div className="flex items-center w-full space-x-4 mb-4 mt-2">
        <input
          type="text"
          value={wsUrl}
          onChange={e => setWsUrl(e.target.value)}
          className="flex-1 px-4 py-2 h-12 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          disabled={streaming}
          placeholder="ws://localhost:8000/asr"
        />

        <button
          className={`
          flex items-center justify-center 
          w-12 h-12
          transition
          ${streaming
              ? "bg-gradient-to-br from-blue-700 to-blue-900 text-white"
              : serverReachable
                ? "bg-gray-700 text-white"
                : "bg-gray-900 text-gray-300 cursor-not-allowed"
            }
          rounded-lg shadow-md
          focus:outline-none
        `}
          onClick={handleButtonClick}
          disabled={!serverReachable}
        >
          {streaming ? (
            // Stop: blueish square with rounded corners and a stop icon
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="8" y="8" width="12" height="12" rx="3" fill="#fff" />
            </svg>
          ) : (
            // Start: red circle in the center of a square
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="8" fill="#ef4444" />
            </svg>
          )}
        </button>
      </div>

      <div className="w-full flex-1 flex flex-col">
        <div
          ref={scrollRef}
          className="w-full bg-gray-900 rounded-lg p-3 text-gray-100 text-base flex flex-col space-y-2 h-full overflow-y-auto"
          style={{ minHeight: 120 }}
        >
          {groupedLines.length === 0 && (
            <span className="text-gray-500">Transcription will appear here...</span>
          )}
          {groupedLines.map((group, idx) => (
            <div
              key={idx}
              className={`flex ${group.speaker % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`rounded-xl px-4 py-2 max-w-[80%] shadow ${group.speaker % 2 === 0
                  ? "bg-blue-700 text-white"
                  : "bg-green-700 text-white"
                  }`}
              >
                <div className="mb-1 text-xs text-gray-300">
                  Speaker {group.speaker}
                  {" · "}
                  {formatTime(group.lines[0].beg)} - {formatTime(group.lines[group.lines.length - 1].end)}
                </div>
                <div>
                  {group.lines.map((line, i) => (
                    <span key={i}>
                      {line.text}
                      {i < group.lines.length - 1 ? " " : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WhisperLiveKitStreamer;
