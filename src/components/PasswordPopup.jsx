import { useTranslation } from "react-i18next";

export default function PasswordPopup({ password, setPassword, error, onSubmit, onClose }) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-700 p-6 rounded-xl shadow-lg w-full max-w-xs relative"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the popup
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
          onClick={onClose}
          aria-label="Close"
        >×</button>
        
        {/* Title */}
        <div className="text-white text-lg mb-4">{t("popup.password-prompt.title")}</div>

        <div className="text-white text-lg mb-4">{t("popup.password-prompt.input-labal")}:</div>
        <input
          type="password"
          className="w-full mb-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-100"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSubmit()}
        />
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <button
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
          onClick={onSubmit}
        >
          {t("popup.password-prompt.submit")}
        </button>
      </div>
    </div>
  );
}
