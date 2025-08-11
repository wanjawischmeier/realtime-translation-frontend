import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import ModalPopup from './ModalPopup';

export default function RoomSetupGuard({ children }) {
    const [currentPopup, setCurrentPopup] = useState(0); // 0 = none, 1 = first popup, 2 = second popup
    const { room_id } = useParams(); 
    const navigate = useNavigate();
    const allowStoreCookieName = `${room_id}-allow_store`; // Cookie paths are unfortunately not viable due to this being an SPA
    const allowClientDownloadCookieName = `${room_id}-allow_client_download`;

    useEffect(() => {
        const allowStore = Cookies.get(allowStoreCookieName);
        const allowClientDownload = Cookies.get(allowClientDownloadCookieName);
        if (!allowStore) {
            setCurrentPopup(1);
        }
        // Only show second popup if first cookie exists AND is "true"
        else if (allowStore === 'true' && !allowClientDownload) {
            setCurrentPopup(2);
        }
        else {
            setCurrentPopup(0); // Nothing to show
        }
    }, []);

    const handleModalAction = (cookieName, isConfirmed) => {
        const value = isConfirmed ? 'true' : 'false';
        Cookies.set(cookieName, value);

        if (cookieName === allowStoreCookieName) {
            // If they said "yes" to first popup, maybe show second
            const allowClientDownload = Cookies.get(allowClientDownloadCookieName);
            if (isConfirmed && !allowClientDownload) {
                setCurrentPopup(2);
            } else {
                setCurrentPopup(0); // Skip second popup if deny
            }
        } else if (cookieName === allowClientDownloadCookieName) {
            setCurrentPopup(0);
        }
    };

    const handleModalCancel = () => {
        Cookies.remove(allowStoreCookieName);
        Cookies.remove(allowClientDownloadCookieName);
        navigate('/rooms/host');
    };

    // First cookie popup
    if (currentPopup === 1) {
        return (
            <ModalPopup
                title='Save transcript?'
                content='Should the script be saved, so that you can acess it after stopping the transcription?'
                confirmText='Yes'
                denyText='No'
                onConfirm={() => handleModalAction(allowStoreCookieName, true)}
                onDeny={() => handleModalAction(allowStoreCookieName, false)}
                onClose={() => handleModalCancel()}
            />
        );
    }

    // Second cookie popup
    if (currentPopup === 2) {
        return (
            <ModalPopup
                title='Allow others to download?'
                content='Should others on the camp be able to download the transcript?'
                confirmText='Yes'
                denyText='No'
                onConfirm={() => handleModalAction(allowClientDownloadCookieName, true)}
                onDeny={() => handleModalAction(allowClientDownloadCookieName, false)}
                onClose={() => handleModalCancel()}
            />
        );
    }

    // All good — render children
    return children;
}
