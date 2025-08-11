import { useAuth } from "./AuthContext";
import Login from "./Login";
import { useLocation } from "react-router-dom";

export default function AuthGuard({ children }) {
  const { isAuthenticated, authenticate } = useAuth();
  const location = useLocation();
  if (!isAuthenticated)
    return (
      <Login
        redirectPath={location.pathname}
        sourcePath={location.state?.from || "/"}
        authenticate={authenticate}
      />
    );

  return children;
}
