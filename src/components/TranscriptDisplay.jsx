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

export default function TranscriptDisplay({ lines, incompleteSentence, targetLang }) {
    const { t } = useTranslation();

    return (
        <div className="w-full mb-4 mt-2">
            <div
                className="w-full bg-gray-900 rounded-lg p-4 text-gray-100 text-base flex flex-col space-y-4 h-full overflow-y-auto"
                style={{ minHeight: 120 }}
            >
                {lines.length === 0 && (!incompleteSentence || incompleteSentence.length === 0) && (
                    <span className="text-gray-500">{t("component.transcript-display.teaser")}</span>
                )}

                {lines.map((line, idx) => (
                    <div
                        key={idx}
                        className={`flex ${line.speaker % 2 === 1 ? "justify-start" : "justify-start"}`}
                    >
                        <div
                            className={`rounded-xl px-4 py-3 max-w-[80%] transition-all duration-200 text-white`}
                        >
                            <div className="mb-1 text-xs text-gray-300">
                                {line.speaker == -1 ? "" : t("component.transcript-display.speaker") + (line.speaker + 1) + " · "}
                                {formatTime(line.beg)} - {formatTime(line.end)}
                            </div>
                            <div className="text-lg leading-relaxed flex flex-wrap">
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

                                {/* Only add incomplete sentence inline inside the last line */}
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

                {/* If no lines but incompleteSentence exists, show incomplete sentence alone */}
                {lines.length === 0 && incompleteSentence && incompleteSentence.length > 0 && (
                    <div
                        className="rounded-xl px-4 py-3 max-w-[80%] transition-all duration-200 text-gray-700 fade-in mx-auto"
                        style={{ lineHeight: "1.2", textAlign: 'left' }}
                    >
                        {incompleteSentence}
                    </div>
                )}
            </div>
        </div>
    );
}
