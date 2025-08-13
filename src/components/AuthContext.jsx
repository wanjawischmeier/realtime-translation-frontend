import { createContext, useContext, useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const authCheckInterval = useRef();

  useEffect(() => {
    const runValidation = async () => {
      await validate()
      setLoading(false);
      authCheckInterval.current = setInterval(validate, 1000*60);
    };

    runValidation();

    return () => {
      clearInterval(authCheckInterval.current);
    };
  });

  async function login(password,role="host") {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password,role }),
    });

    if (response.ok) {
      setIsAuthenticated(true);
      const json = await response.json()
      setRole(json.power)
      Cookies.set("authenticated", json.key, { expires: json.expire_hours / 24 });

      return true;
    } else {
      Cookies.remove("authenticated");
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
    }
    else {
      setIsAuthenticated(false);
    }
  }


  return (
    <AuthContext.Provider value={{ isAuthenticated, login, getKey, role }}>
      {loading ? "Loading ..." : children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
