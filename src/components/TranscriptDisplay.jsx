import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFullscreen } from "../help/useFullscreen";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

function formatTime(t) {
    const hours = Math.floor(t / 3600);
    const minutes = Math.floor((t % 3600) / 60);
    const seconds = t % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export default function TranscriptDisplay({ lines, incompleteSentence, targetLang }) {
    const { t } = useTranslation();
    const containerRef = useRef(null);

    const fullscreenContainerRef = useRef(null);
    const { isFullscreen, toggleFullscreen, isMobile } = useFullscreen();
    const onToggleFullscreen = () => {
        if (fullscreenContainerRef.current) {
            toggleFullscreen(fullscreenContainerRef.current);
        }
    };

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
        <div
            ref={fullscreenContainerRef}
            className={`relative flex flex-col rounded-lg bg-gray-900 ${isFullscreen ? "fixed top-0 left-0 w-full z-50" : "flex-grow basis-0"
                }`}
            style={{ transition: "all 0.3s ease" }}
        >
            <button
                onClick={onToggleFullscreen}
                className="absolute top-2 right-2 z-50 bg-gray-700 rounded p-1 hover:bg-gray-600 text-white"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                type="button"
            >
                {isFullscreen ? <MdFullscreenExit size={24} /> : <MdFullscreen size={24} />}
            </button>

            <div className="flex-grow basis-0 w-full mb-4 mt-2 overflow-y-auto" style={{ height: isFullscreen ? "100vh" : '100%' }}>
                <div
                    ref={containerRef}
                    className="w-full bg-gray-900 rounded-lg sm:rounded-none p-4 text-gray-100 text-base flex flex-col space-y-4 h-full"
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

        </div>


    );
}
