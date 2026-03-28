import React from 'react';
import { Spinner } from 'react-bootstrap'; // Make sure react-bootstrap is installed

const Loading = ({ show = true, spinnerVariant = "light", backdropOpacity = 0.5 }) => {
    if (!show) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: `rgba(0,0,0,${backdropOpacity})`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            }}
        >
            <Spinner animation="border" variant={spinnerVariant} />

        </div>
    );
};

export default Loading;