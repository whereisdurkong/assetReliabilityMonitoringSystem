export default function Maintenance() {
    return (
        <div
            className="min-h-screen w-full flex items-center justify-center p-4"
            style={{ backgroundColor: '#171C2D' }}
        >
            <div
                className="max-w-md w-full rounded-2xl shadow-xl p-8 text-center"
                style={{ backgroundColor: '#254252' }}
            >
                {/* Feather Icon - Settings/Tools */}
                <div className="mb-6 flex justify-center">
                    <div
                        className="p-4 rounded-full"
                        style={{ backgroundColor: '#EAB56F20' }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#EAB56F"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10z" />
                            <path d="M12 6v6l4 2" />
                            <path d="M16 21.17a10 10 0 0 1-4 0" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h1
                    className="text-3xl font-bold mb-3"
                    style={{ color: '#EAB56F' }}
                >
                    Under Maintenance
                </h1>

                {/* Description */}
                <p
                    className="mb-6 text-base leading-relaxed"
                    style={{ color: '#F9982F' }}
                >
                    We're currently performing scheduled maintenance to improve your experience.
                    Please check back soon.
                </p>

                {/* Estimated time */}
                <div
                    className="flex items-center justify-center gap-2 text-sm mb-6"
                    style={{ color: '#EAB56F' }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Estimated completion: 2-3 hours</span>
                </div>

                {/* Contact link */}
                <a
                    href="mailto:support@example.com"
                    className="inline-flex items-center gap-2 font-medium transition-opacity hover:opacity-80"
                    style={{ color: '#E37239' }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Contact Support
                </a>
            </div>
        </div>
    );
}