import { useServerHealth } from "./ServerHealthContext";
import { useTranslation } from "react-i18next";
import LanguageSelect from "./LanguageSelect";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

export default function LocalizationSelect() {
    const serverReachable = useServerHealth();
    const { t, i18n } = useTranslation();

    return (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-700 bg-opacity-90 rounded-lg shadow-lg p-2 flex items-center">
            <FontAwesomeIcon icon={faGlobe} className="mr-2 text-white" />
            <LanguageSelect 
                className="px-2 text-gray-100" 
                lang={i18n.language} 
                languages={i18n.options.supportedLngs} 
                setLang={i18n.changeLanguage} 
            />
        </div>
    );
}
