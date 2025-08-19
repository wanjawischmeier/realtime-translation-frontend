import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";
import Login from "./Login";
import { useLocation } from "react-router-dom";

export default function SecureConnectionGuard({ children }) {

  const { t } = useTranslation();

  const location = useLocation();
  console.log(location.protocol)
  if (location.protocol !== 'https:')
    return (
      <div className="h-100 flex flex-col p-4">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-4 select-none text-center text-white">{t("component.secure-block.title")}</h1>
        <hr className="h-px mb-3 text-gray-600 border-2 bg-gray-600"></hr>

        {/* Back button at bottom */}
        <button
          className="mt-20 mb-20 w-full py-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
          onClick={() => navigate(`"${location.state?.from || "/"}"`)}
        >
          {t("component.secure-block.back")}
        </button>
      </div>
    );

  return children;
}
