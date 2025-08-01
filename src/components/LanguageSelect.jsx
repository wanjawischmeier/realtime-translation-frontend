import React, { useState } from 'react';

export default function LanguageSelect({ lang,setLang }) {
     return (
        <select
                className="px-4 p-2 box-border rounded-lg bg-gray-700 text-gray-100 w-full"
                value={lang}
                onChange={e => setLang(e.target.value)}
            >
                <option value="en">English</option>
                <option value="de">German</option>
                <option value="fr">French</option>
                {/* Add more as needed */}
        </select>
    );
};
