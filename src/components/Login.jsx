import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useServerHealth } from "./ServerHealthContext";

export default function Login({ login, redirectPath, sourcePath }) {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const serverReachable = useServerHealth();
  const { t } = useTranslation();

  const inputRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && popupRef.current) {
      inputRef.current.focus({ preventScroll: true });

      setTimeout(() => {
        if (!popupRef.current) {
          return;
        }

        popupRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }, 200);  // 200ms delay to allow mobile keyboard viewport resizing
    }
  }, []);

  async function handleLogin() {
    if (await login(password)) {
      navigate(redirectPath);
    } else {
      setPassword("");
    }
  };

  function onClose() {
    navigate(sourcePath);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50"
      onClick={onClose}
    >
      <div
        ref={popupRef}
        className="bg-gray-700 p-6 rounded-xl shadow-lg w-full max-w-xs relative"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the popup
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
          onClick={onClose}
          aria-label="Close"
        >×</button>

        <div className="text-white text-2xl mb-4">{t("popup.login.title")}</div>
        <div className="text-white text-lg mb-4">{t("popup.login.input-label")}:</div>
        <input
          ref={inputRef}
          type="password"
          className="w-full mb-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-100"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />

        <button
          className={`
            w-full py-2 rounded-lg font-bold
          bg-blue-700 text-white hover:bg-blue-900
          disabled:bg-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed
          `}
          onClick={handleLogin}
          disabled={!serverReachable || !password}
        >
          {t("popup.login.submit")}
        </button>
      </div>
    </div>
  );
};

