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

  function authenticate(password) {
    if (password == "letmein") {
      setIsAuthenticated(true);
      Cookies.set("authenticated", password, { path: "/" });
      return true
    }
    else {
      return false;
    }
  }

  function getCookie() {
    const cookie = Cookies.get("authenticated");
    return cookie;
  }

  function getPassword() {
    return getCookie()
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, authenticate, getPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
};
