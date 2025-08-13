import { useAuth } from "./AuthContext";
import Login from "./Login";
import { useLocation } from "react-router-dom";

export default function AuthGuard({ children,needAdmin=false }) {
  const { isAuthenticated, login, role } = useAuth();
  const location = useLocation();
  if (!isAuthenticated || (needAdmin && role != "admin"))
    return (
      <Login
        redirectPath={location.pathname}
        sourcePath={location.state?.from || "/"}
        login={(password) => {
          return login(password,needAdmin ? "admin" : null)
        }}
      />
    );

  return children;
}
