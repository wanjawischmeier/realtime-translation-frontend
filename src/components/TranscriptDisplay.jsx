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
                {lines.length === 0 && incompleteSentence != null && (
                    <span className="text-gray-500">{t("component.transcript-display.teaser")}</span>
                )}
                {lines.map((line, idx) => (
                    <div
                        key={idx}
                        className={`flex ${line.speaker % 2 === 1 ? "justify-start" : "justify-start"}`}
                    >
                        <div
                            className={`rounded-xl px-4 py-3 max-w-[80%] shadow-md transition-all duration-200 ${line.speaker % 2 === 0
                                ? "text-white"
                                : "text-white"
                                }`}
                        >
                            <div className="mb-1 text-xs text-gray-300">
                                {line.speaker == -1 ? "" : t("component.transcript-display.speaker") + (line.speaker + 1) + " · "}
                                {formatTime(line.beg)} - {formatTime(line.end)}
                            </div>
                            <div className="text-lg leading-relaxed flex flex-col">
                                {line.sentences.map((sentence, i) => {
                                    if (sentence['content'][targetLang]) {
                                        return (
                                            <span style={{ lineHeight: '1.2' }} className="text-white-400" key={i}>
                                                {sentence.content[targetLang]}
                                            </span>
                                        )
                                    }
                                })}
                                <span style={{ lineHeight: '1.2' }} className="text-gray-400">{incompleteSentence}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
