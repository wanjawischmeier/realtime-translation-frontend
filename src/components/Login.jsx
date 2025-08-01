import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function Login ({ authenticate,redirectPath,sourcePath }) {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleLogin () {
    // Replace with your actual authentication logic
    if (authenticate(password)) {
      navigate(redirectPath);
    } else {
      alert("Incorrect password");
    }
  };

  function onClose () {
    navigate(sourcePath);
  };


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
        <div className="text-white text-lg mb-4">Enter password to create a room:</div>
        <input
          type="password"
          className="w-full mb-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-100"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />

        <button
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
          onClick={handleLogin}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

