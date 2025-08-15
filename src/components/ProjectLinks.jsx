import { FaGithub } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function ProjectLinks() {
    const { t } = useTranslation();

    return (
        < a
            href={import.meta.env.VITE_GITHUB_PROJECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-700 rounded-lg shadow-lg p-4 flex items-center gap-4 text-white"
        >
            <FaGithub size={20} className="text-white" />
            <span className="hidden sm:inline">{t('component.project-links.github')}</span>
        </a >
    );
}
