import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LanguageSelect from "../components/LanguageSelect";
import { TranscriptListProvider } from "../components/TranscriptListProvider";
import { RoomsProvider } from "../components/RoomsProvider";
import Spinner from "../components/Spinner";
import TranscriptDownloadButton from "../components/TranscriptDownloadButton";
import { useTranslation } from "react-i18next";

export default function TranscriptListView() {
    const { availableTranscriptInfos } = TranscriptListProvider();
    const [lang, setLang] = useState(null);

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { availableTargetLangs } = RoomsProvider();

    useEffect(() => {
        if (availableTargetLangs) {
            setLang(availableTargetLangs[0]);
        }
    }, [availableTargetLangs]);

    return (
        <div className="h-full flex flex-col p-4 text-white">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-4 select-none text-center">
                {t("page.transcript.title")}
            </h1>
            <hr className="h-px mb-4 text-gray-600 border-2 bg-gray-600" />

            {/* Language Selector */}
            <div className="flex items-center space-x-3 mb-4">
                <span className="font-medium select-none">{t("page.transcript.language-select-label")}:</span>
                <LanguageSelect lang={lang} setLang={setLang} languages={availableTargetLangs} />
            </div>

            {/* Scrollable List Area */}

            {
                (availableTranscriptInfos.length > 0) ?
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4 max-h-[calc(100vh-250px)]">
                        {
                            availableTranscriptInfos.map((transcriptInfo) => (
                                <div
                                    key={transcriptInfo.id}
                                    className="flex justify-between items-center bg-gray-700 p-4 rounded-lg"
                                >
                                    <div>
                                        <div className="text-lg font-semibold">{transcriptInfo.title}</div>
                                        <div className="text-gray-300 text-sm">
                                            {t("page.room-list.list.presenter-label")}: {
                                                transcriptInfo.persons[0]?.name ?? t("page.room-list.list.unknown-presenter-name")} · {t("page.room-list.list.location-label")}: {transcriptInfo.room}
                                        </div>
                                    </div>
                                    <TranscriptDownloadButton roomId={transcriptInfo.code} targetLang={lang} />
                                </div>
                            ))
                        }
                    </div>
                    : <Spinner />
            }



            {/* Back Button */}
            <button
                className="mt-4 py-3 w-full rounded bg-gray-600 hover:bg-gray-700 font-bold"
                onClick={() => navigate("/")}
            >
                Back
            </button>
        </div>
    );
}
