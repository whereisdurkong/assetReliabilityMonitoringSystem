// AlertModal.jsx
import React, { useEffect } from 'react';
import './AlertModal.css';

// Symbol components
const SuccessSymbol = () => (
    <svg className="alert-symbol" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#F9982F" stroke="#E37239" strokeWidth="2" />
        <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ErrorSymbol = () => (
    <svg className="alert-symbol" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#E37239" stroke="#F9982F" strokeWidth="2" />
        <path d="M15 9L9 15M9 9L15 15" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

const WarningSymbol = () => (
    <svg className="alert-symbol" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L21 19H3L12 3Z" fill="#EAB56F" stroke="#F9982F" strokeWidth="2" />
        <circle cx="12" cy="15" r="1.5" fill="white" />
        <path d="M12 8V12" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const InfoSymbol = () => (
    <svg className="alert-symbol" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#F9982F" stroke="#EAB56F" strokeWidth="2" />
        <circle cx="12" cy="8" r="1.5" fill="white" />
        <path d="M12 12V16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const AlertModal = ({ type, title, description, onClose, autoClose = 5000 }) => {
    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoClose);

            return () => clearTimeout(timer);
        }
    }, [autoClose, onClose]);

    const getSymbol = () => {
        switch (type) {
            case 'success':
                return <SuccessSymbol />;
            case 'error':
                return <ErrorSymbol />;
            case 'warning':
                return <WarningSymbol />;
            default:
                return <InfoSymbol />;
        }
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return 'alert-success';
            case 'error':
                return 'alert-error';
            case 'warning':
                return 'alert-warning';
            default:
                return 'alert-info';
        }
    };

    return (
        <div className="alert-modal-container">
            <div className={`alert-modal ${getTypeStyles()}`}>
                <div className="alert-modal-content">
                    <div className="alert-modal-symbol">
                        {getSymbol()}
                    </div>
                    <div className="alert-modal-text">
                        <h3 className="alert-modal-title">{title}</h3>
                        <p className="alert-modal-description">{description}</p>
                    </div>
                    <button onClick={onClose} className="alert-modal-close">
                        <span className="sr-only">Close</span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 5L5 15M5 5L15 15" stroke="#EAB56F" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
                <div className="alert-progress-bar" />
            </div>
        </div>
    );
};

export default AlertModal;