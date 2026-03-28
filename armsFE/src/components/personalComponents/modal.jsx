// Modal.jsx
import React, { useEffect } from 'react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium',
    variant = 'default',
    showCloseButton = true,
    closeOnOverlayClick = true,
    customStyles = {},
    footerContent
}) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return { width: '400px' };
            case 'large':
                return { width: '800px' };
            case 'full':
                return { width: '95%', maxWidth: '1200px', margin: '20px' };
            default:
                return { width: '600px' };
        }
    };

    const getVariantColor = () => {
        switch (variant) {
            case 'success':
                return '#F9982F';
            case 'warning':
                return '#E37239';
            case 'info':
                return '#254252';
            default:
                return '#EAB56F';
        }
    };

    const overlayStyles = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(23, 28, 45, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease',
        ...customStyles.overlay
    };

    const containerStyles = {
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(23, 28, 45, 0.3)',
        maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'slideIn 0.3s ease',
        position: 'relative',
        borderTop: `4px solid ${getVariantColor()}`,
        ...getSizeStyles(),
        ...customStyles.container
    };

    const headerStyles = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: '1px solid #eef2f6',
        background: 'linear-gradient(to right, #f8fafc, white)'
    };

    const titleStyles = {
        fontSize: '1.5rem',
        fontWeight: 600,
        color: '#171C2D',
        margin: 0
    };

    const closeButtonStyles = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#254252',
        transition: 'all 0.2s ease'
    };

    const bodyStyles = {
        padding: '24px',
        color: '#254252',
        lineHeight: 1.6
    };

    const footerStyles = {
        padding: '20px 24px',
        borderTop: '1px solid #eef2f6',
        backgroundColor: '#f8fafc',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px'
    };

    // Add keyframe animations to document if they don't exist
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideIn {
        from {
          transform: translateY(-30px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div
            style={overlayStyles}
            onClick={handleOverlayClick}
        >
            <div
                style={containerStyles}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div style={headerStyles}>
                    <h2 id="modal-title" style={titleStyles}>
                        {title}
                    </h2>
                    {showCloseButton && (
                        <button
                            style={closeButtonStyles}
                            onClick={onClose}
                            aria-label="Close modal"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(234, 181, 111, 0.1)';
                                e.currentTarget.style.color = '#E37239';
                                e.currentTarget.style.transform = 'rotate(90deg)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#254252';
                                e.currentTarget.style.transform = 'rotate(0deg)';
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                <div style={bodyStyles}>
                    {children}
                </div>

                {footerContent && (
                    <div style={footerStyles}>
                        {footerContent}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;