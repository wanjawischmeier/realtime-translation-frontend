import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Spinner from '../components/Spinner';
import { useTranslation } from 'react-i18next';

export default function HelpView() {
    const [markdown, setMarkdown] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const { t } = useTranslation();

    useEffect(() => {
        document.title = t("page.help.title") + " - " + t('dom-title')

        const url = import.meta.env.VITE_HELP_MARKDOWN_URL;
        if (!url) {
            setError('Help markdown URL not configured');
            return;
        }
        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
                return res.text();
            })
            .then((text) => setMarkdown(text))
            .catch((err) => setError(err.message));
    }, []);

    return (
        <div className='h-full flex flex-col p-4 bg-gray-800 text-white'>
            {/* Header */}
            <h1 className="text-3xl font-bold mb-4 select-none text-center">{t("page.help.title")}</h1>
            <hr className="h-px mb-3 text-gray-600 border-2 bg-gray-600"></hr>


            {markdown === null && !error && (
                <Spinner></Spinner>
            )}

            {markdown !== null && !error && (
                < div className='overflow-y-auto pr-2 flex-grow max-h-[calc(100vh-250px)]'>
                    {error && <div className='text-red-400'>{error}</div>}
                    <div className='space-y-4'>
                        <ReactMarkdown
                            components={{
                                h1: ({ node, ...props }) => (
                                    <h1 className='text-3xl font-bold mt-6 mb-2' {...props} />
                                ),
                                h2: ({ node, ...props }) => (
                                    <h2 className='text-2xl font-semibold mt-5 mb-2' {...props} />
                                ),
                                h3: ({ node, ...props }) => (
                                    <h3 className='text-xl font-semibold mt-4 mb-2' {...props} />
                                ),
                                h4: ({ node, ...props }) => (
                                    <h4 className='text-lg font-medium mt-3 mb-1' {...props} />
                                ),
                                p: ({ node, ...props }) => (
                                    <p className='text-base leading-relaxed' {...props} />
                                ),
                                strong: ({ node, ...props }) => (
                                    <strong className='font-semibold text-white' {...props} />
                                ),
                                em: ({ node, ...props }) => (
                                    <em className='italic text-white' {...props} />
                                ),
                                ul: ({ node, ...props }) => (
                                    <ul className='list-disc ml-6 space-y-1' {...props} />
                                ),
                                ol: ({ node, ...props }) => (
                                    <ol className='list-decimal ml-6 space-y-1' {...props} />
                                ),
                                li: ({ node, ...props }) => (
                                    <li className='leading-relaxed' {...props} />
                                ),
                                a: ({ node, ...props }) => (
                                    <a
                                        className='text-blue-400 underline hover:text-blue-300'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        {...props}
                                    />
                                ),
                                img: ({ node, ...props }) => (
                                    <img className='my-4 max-w-full h-auto rounded' {...props} />
                                ),
                            }}
                        >
                            {markdown}
                        </ReactMarkdown>
                    </div>
                </div>
            )
            }


            {/* Back Button */}
            <button
                className='mt-4 w-full py-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700'
                onClick={() => navigate('/')}
            >
                {t("page.help.back")}
            </button>
        </div >
    );
}
