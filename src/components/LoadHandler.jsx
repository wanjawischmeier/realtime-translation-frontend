import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";

export default function LoadHandler({ title, backNavigation }) {
    const navigate = useNavigate();

    return (
        <div className="h-100 flex flex-col p-4">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-4 select-none text-center text-white">{title}</h1>
            <hr className="h-px mb-8 text-gray-600 border-2 bg-gray-600"></hr>

            <Spinner></Spinner>

            {/* Back button at bottom */}
            <button
                className="mt-20 mb-20 w-full py-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700"
                onClick={() => navigate(`"${backNavigation}"`)}
            >
                Back
            </button>
        </div>
    );
}
