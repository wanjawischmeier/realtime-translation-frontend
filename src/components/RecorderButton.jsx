import React, { useState } from 'react';

export default function RecorderButton({ serverReachable, stopStreaming, startStreaming, streaming, monitor }) {
    const { dataArrayRef, analyserRef } = monitor;
    const [volume, setVolume] = useState(0);

    const registerThresholf = 15;
    const powerThresholf = 85;

    const monitorVolume = () => {
        const getVolume = () => {
            if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
                const average = sum / dataArrayRef.current.length;
                setVolume(average > registerThresholf ? average : 0);
            } else
                setVolume(0)
            requestAnimationFrame(getVolume);
        };
        getVolume();
    };

    const handleButtonClick = () => {
        if (streaming) {
            setVolume(0)
            stopStreaming();
        } else {
            startStreaming();
            monitorVolume()
        }
    };


    return (
        <button
            className={`
          flex items-center justify-center 
          w-12 h-12
          transition
          ${streaming
                    ? "bg-gradient-to-br from-blue-700 to-blue-900 text-white"
                    : serverReachable
                        ? "bg-gray-700 text-white"
                        : "bg-gray-900 text-gray-300 cursor-not-allowed"
                }
          rounded-lg shadow-md
          focus:outline-none
        `}
            style={{
                boxShadow: streaming ? `0 0 ${Math.min((volume > powerThresholf ? volume : Math.pow(volume / powerThresholf, 2)*powerThresholf), 250)/4}px rgba(0, 0, 255, 0.7)` : 'none',
                transition: 'box-shadow 0.1s ease',
            }}
            onClick={handleButtonClick}
            disabled={!serverReachable}
        >
            {streaming ? (
                // Stop: blueish square with rounded corners and a stop icon
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="8" y="8" width="12" height="12" rx="3" fill="#fff" />
                </svg>
            ) : (
                // Start: red circle in the center of a square
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="8" fill="#ef4444" />
                </svg>
            )}
        </button>
    );
};
