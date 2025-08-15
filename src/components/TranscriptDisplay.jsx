import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

function formatTime(t) {
    const hours = Math.floor(t / 3600);
    const minutes = Math.floor((t % 3600) / 60);
    const seconds = t % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export default function TranscriptDisplay({ lines, incompleteSentence, targetLang, isFullscreen }) {
    const { t } = useTranslation();
    const containerRef = useRef(null);

    const SCROLL_THRESHOLD = 100;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        if (distanceFromBottom < SCROLL_THRESHOLD) {
            container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
        }
    }, [lines, incompleteSentence, targetLang]);

    return (
        <div className="w-full mb-4 mt-2">
            <div
                ref={containerRef}
                className="w-full bg-gray-900 rounded-lg sm:rounded-none p-4 text-gray-100 text-base flex flex-col space-y-4 h-full overflow-y-auto"
                style={{ minHeight: 120 }}
            >
                {lines.length === 0 && (!incompleteSentence || incompleteSentence.length === 0) && (
                    <span className="text-gray-500">{t("component.transcript-display.teaser")}</span>
                )}

                {lines.map((line, idx) => (
                    <div
                        key={idx}
                        className="flex justify-start"
                    >
                        <div
                            className="rounded-xl px-4 py-3 max-w-[80%] transition-all duration-200 text-white"
                        >
                            <div className="mb-1 text-xs text-gray-300">
                                {line.speaker === -1 ? "" : t("component.transcript-display.speaker") + (line.speaker + 1) + " · "}
                                {formatTime(line.beg)} - {formatTime(line.end)}
                            </div>
                            <div className="text-lg leading-relaxed flex flex-wrap overflow-y-auto">
                                {line.sentences.map((sentence, i) => {
                                    if (sentence.content && sentence.content[targetLang]) {
                                        return (
                                            <span
                                                key={i}
                                                className="text-white-400 fade-in"
                                                style={{ lineHeight: "1.2", marginRight: "0.25rem" }}
                                            >
                                                {sentence.content[targetLang]}
                                            </span>
                                        );
                                    }
                                    return null;
                                })}

                                {idx === lines.length - 1 && incompleteSentence && incompleteSentence.length > 0 && (
                                    <span
                                        className="text-gray-700 fade-in"
                                        style={{ lineHeight: "1.2" }}
                                    >
                                        {incompleteSentence}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {lines.length === 0 && incompleteSentence && incompleteSentence.length > 0 && (
                    <div
                        className="rounded-xl px-4 py-3 max-w-[80%] transition-all duration-200 text-gray-700 fade-in"
                        style={{ lineHeight: "1.2", textAlign: 'left' }}
                    >
                        {incompleteSentence}
                    </div>
                )}
            </div>
        </div>
    );
}
