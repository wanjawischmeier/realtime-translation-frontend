import { useTranslation } from "react-i18next";
import LanguageSelect from "./LanguageSelect";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

export default function LocalizationSelect() {
    const { i18n } = useTranslation();

    return (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-700 rounded-lg shadow-lg px-4 py-2 flex items-center">
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
