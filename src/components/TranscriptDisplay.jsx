import React, { useState } from 'react';

function formatTime(t) {
    if (!t) return "";
    const parts = t.split(":");
    return parts.length === 3 ? `${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}` : t;
}

export default function TranscriptDisplay({ lines }) {
    const groupedLines = [];
    let lastSpeaker = null;
    let lastLines = [];
    const [targetLang, setTargetLang] = useState("en");

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
        <div className="w-full flex-1 flex flex-col p-4 bg-gray-800 rounded-lg shadow-lg">

            <select
                className="ml-4 mb-4 px-4 py-2 rounded-lg bg-gray-700 text-gray-100"
                value={targetLang}
                onChange={e => setTargetLang(e.target.value)}
            >
                <option value="en">English</option>
                <option value="de">German</option>
                <option value="fr">French</option>
                {/* Add more as needed */}
            </select>

            <div
                className="w-full bg-gray-900 rounded-lg p-4 text-gray-100 text-base flex flex-col space-y-4 h-full overflow-y-auto"
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
                            className={`rounded-xl px-4 py-3 max-w-[80%] shadow-md transition-all duration-200 ${group.speaker % 2 === 0
                                ? "bg-blue-700 text-white"
                                : "bg-green-700 text-white"
                                }`}
                        >
                            <div className="mb-1 text-xs text-gray-300">
                                Speaker {group.speaker}
                                {" · "}
                                {formatTime(group.lines[0].beg)} - {formatTime(group.lines[group.lines.length - 1].end)}
                            </div>
                            <div className="text-lg leading-relaxed">
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
