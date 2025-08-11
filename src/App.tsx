import React, { useState, useEffect } from 'react';
import SignIn from './pages/SignIn';
import MainView from './pages/MainView';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = (window as any).auth.getToken();
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    return (
        <>
            {isAuthenticated ? <MainView /> : <SignIn onLoginSuccess={handleLoginSuccess} />}
        </>
    );
};

export default App;
