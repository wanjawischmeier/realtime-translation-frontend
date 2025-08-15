import { useTranslation } from "react-i18next";
import LanguageSelect from "./LanguageSelect";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

export default function LocalizationSelect() {
    const { i18n } = useTranslation();

    return (
        <div className="bg-gray-700 rounded-lg shadow-lg px-4 py-2 flex items-center">
            <FontAwesomeIcon icon={faGlobe} className="mr-2 text-white" />
            <LanguageSelect 
                lang={i18n.language} 
                languages={i18n.options.supportedLngs} 
                setLang={i18n.changeLanguage}
            />
        </div>
    );
}
