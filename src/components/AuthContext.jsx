import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (getCookie()) {
      setIsAuthenticated(true);
    }
  }, []);

  async function checkPassword(password) {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });
    return response.ok;
  }

  async function authenticate(password) {
    if (await checkPassword(password)) {
      setIsAuthenticated(true);
      Cookies.set("authenticated", password, { expires: import.meta.env.VITE_COOKIE_EXPIRATION_HOURS/24 });
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

  function getPassword() {
    return getCookie();
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, authenticate, getPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
