import { createContext, useContext, useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import Spinner from "./Spinner";
import { useToast } from "./ToastProvider";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const authCheckInterval = useRef();
  const { addToast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const runValidation = async () => {
      await validate()
      setLoading(false);
      authCheckInterval.current = setInterval(validate, 1000 * (isAuthenticated ? 60 : 120));
    };

    runValidation();

    return () => {
      clearInterval(authCheckInterval.current);
    };
  });

  async function login(password, role = null) {
    var response;
    try {
      response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, role }),
      });
    } catch (error) {
      addToast({
        title: "Failed to sign in",
        message: `${error.name}: ${error.message}`,
        type: "error",
      });
    }

    if (response.ok) {
      setIsAuthenticated(true);
      const json = await response.json()
      setRole(json.power)
      Cookies.set("authenticated", json.key, { expires: json.expire_hours / 24 });
      return true;
    } else if (response.status === 503) {
      Cookies.remove("authenticated");
      addToast({
        title: t("popup.login.failed.title"),
        message: t("popup.login.failed.wrong-password"),
        type: "error",
      });
    } else {
      Cookies.remove("authenticated");
      addToast({
        title: t("popup.login.failed.title"),
        message: response.statusText,
        type: "error",
      });
      return false;
    }
  }

  function getCookie() {
    const cookie = Cookies.get("authenticated");
    return cookie;
  }

  function getKey() {
    return getCookie();
  }

  async function validate() {
    const key = getKey()
    if (key) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: key }),
        });

        if (response.ok) {
          const json = await response.json()
          setIsAuthenticated(true);
          setRole(json.power)
        } else {
          setIsAuthenticated(false);
          setRole(null)
          Cookies.remove("authenticated");
        }
      } catch (error) {
        setIsAuthenticated(false);
        setRole(null)
        Cookies.remove("authenticated");
      }
    }
    else {
      setIsAuthenticated(false);
    }
  }


  return (
    <AuthContext.Provider value={{ isAuthenticated, login, getKey, role, validate }}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 svg-bg">
          <div className="relative bg-gray-800 shadow-lg w-full sm:w-auto min-h-screen sm:min-h-[600px] sm:rounded-xl sm:min-w-[600px] p-4">
            <Spinner></Spinner>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
