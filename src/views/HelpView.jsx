import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function HelpView() {
    const [markdown, setMarkdown] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
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
            <h1 className="text-3xl font-bold mb-4 select-none text-center">Help</h1>
            <hr className="h-px mb-8 text-gray-600 border-2 bg-gray-600"></hr>

            {/* Scrollable Main Content */}
            <div className='overflow-y-auto pr-2 flex-grow max-h-[calc(100vh-250px)]'>
                {error && <div className='text-red-400'>{error}</div>}

                {markdown === null && !error && (
                    <div className='flex justify-center items-center h-full'>
                        {/* https://flowbite.com/docs/components/spinner */}
                        <div role="status" className='m-8'>
                            <svg
                                aria-hidden="true"
                                className="w-16 h-16 animate-spin text-gray-700 fill-blue-700"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                />
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                )}

                {markdown !== null && !error && (
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
                )}
            </div>

            {/* Back Button */}
            <button
                className='mt-4 w-full py-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700'
                onClick={() => navigate('/')}
            >
                Back
            </button>
        </div>
    );
}
