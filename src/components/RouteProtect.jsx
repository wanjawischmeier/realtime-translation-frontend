import { useEffect } from "react";
import { useAuth } from "./AuthContext";
import Cookies from "js-cookie";
import Login from "./Login";
import { useLocation, useNavigate } from "react-router-dom";

export default function RouteProtect({ element }) {
  const { isAuthenticated, authenticate } = useAuth();
  const location = useLocation();
  return isAuthenticated ? element : <Login redirectPath={location.pathname} sourcePath={location.state?.from || "/"} authenticate={authenticate} />;
}
