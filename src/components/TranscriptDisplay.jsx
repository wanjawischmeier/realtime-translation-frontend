import { useTranslation } from "react-i18next";

function formatTime(t) {
    return t;
}

export default function TranscriptDisplay({ lines, incompleteSentence, targetLang }) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col w-full space-x-4 mb-4 mt-2 space-y-4">
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
                                {t("component.transcript-display.speaker")} {line.speaker + 1}
                                {" · "}
                                {formatTime(line.beg)} - {formatTime(line.end)}
                            </div>
                            <div className="text-lg leading-relaxed">
                                {line.sentences.map((sentence, i) => {
                                    if (sentence['content'][targetLang]) {
                                        return (
                                            <span key={i}>
                                                {sentence.content[targetLang]}
                                            </span>
                                        )
                                    }
                                })}
                                <span className="text-gray-400">{incompleteSentence}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
