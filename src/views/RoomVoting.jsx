import { useNavigate } from "react-router-dom";
import { useServerHealth } from "../components/ServerHealthContext";
import { useToast } from "../components/ToastProvider";
import Spinner from "../components/Spinner";
import { useAuth } from "../components/AuthContext";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import trackUmami from "../help/umamiHelper";
import RoomStatus from "../components/RoomStatus";
import { useEffect } from "react";
import { VoteProvider } from "../components/VoteProvider";

export default function RoomVoting() {
    const { rooms, fetchUpdate, myVotes, handleVote } = VoteProvider();

    const { t } = useTranslation();
    const navigate = useNavigate();

    const serverReachable = useServerHealth();
    const { addToast } = useToast();

    useEffect(() => { document.title = t("page.room-list.title") + " - " + t('dom-title') });

    return (
        <div className="h-full flex flex-col p-4 text-white w-full">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-4 select-none text-center">{t("page.room-list.title")}</h1>
            <hr className="h-px mb-4 text-gray-600 border-2 bg-gray-600" />

            {
                (rooms.length > 0) ? (
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4 max-h-[calc(100vh-250px)]">
                        {/* Scrollable Room List */}

                        {
                            rooms.map(room => {
                                const voteAmount = room.votes
                                const iVoted = myVotes[room.code] == true ? true : false;

                                return (
                                    <div key={room.id} className="flex bg-gray-700 rounded-lg overflow-hidden">
                                        {/* Color strip */}
                                        <div
                                            className="w-4 flex-shrink-0"
                                            style={{ backgroundColor: room.track.color }}
                                        ></div>

                                        {/* Card content */}
                                        <div className="flex flex-col gap-4 justify-end items-end p-4 flex-grow">
                                            <div className="flex w-full justify-between align-center flex-row">
                                                <div className="text-lg font-bold">{t("page.vote.vote", {votes:room.votes})}</div>
                                                <button
                                                    key={iVoted + room.id}
                                                    className={`whitespace-nowrap px-4 py-2 rounded font-bold fade-in
                                                    ${!iVoted
                                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                            : "bg-red-600 hover:bg-red-700 text-white"
                                                        }`} onClick={() => {
                                                            handleVote(room, !iVoted)
                                                        }}
                                                >
                                                    {!iVoted ? t("page.vote.add-vote-button") : t("page.vote.remove-vote-button")}
                                                </button>
                                            </div>
                                            <div className="text-m w-full font-semibold">{room.title}</div>


                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                ) : (
                    <Spinner></Spinner>
                )
            }



            {/* Back Button */}
            <button
                className="mt-4 py-3 w-full rounded bg-gray-600 hover:bg-gray-700 font-bold"
                onClick={() => navigate("/")}
            >
                {t("page.room-list.back")}
            </button>
        </div>
    );
}
