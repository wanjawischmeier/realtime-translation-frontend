// TranscriptDisplay.js
import React from 'react';

function formatTime(t) {
    if (!t) return "";
    const parts = t.split(":");
    return parts.length === 3 ? `${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}` : t;
}

export default function TranscriptDisplay ({ lines }) {
    // Group lines by speaker for chat bubbles
    const groupedLines = [];
    let lastSpeaker = null;
    let lastLines = [];

    lines.forEach((line) => {
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
        <div className="w-full flex-1 flex flex-col">
            <div
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
    );
};
