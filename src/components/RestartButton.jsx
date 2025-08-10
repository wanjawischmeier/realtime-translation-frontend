import { FaSync } from "react-icons/fa";

export default function RestartButton({ disabled, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`
                flex items-center justify-center gap-2
                h-12 px-4
                rounded-lg shadow-md transition
                focus:outline-none
                ${disabled
                    ? "bg-yellow-800 text-yellow-600 cursor-not-allowed"
                    : "bg-yellow-600 hover:bg-yellow-700 text-yellow-500 cursor-pointer"
                }
            `}
            aria-label="Restart">
            <FaSync className={`w-6 h-6 ${disabled ? "opacity-50" : ""}`} />
            <span className="font-medium select-none text-white">Restart room</span>
        </button>
    );
}
