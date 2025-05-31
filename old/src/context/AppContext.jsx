// ~/my/codes/deeplike/src/context/AppContext.jsx
import React, {createContext, useState, useContext, useEffect} from 'react';

const AppContext = createContext({
    activeApp: 'sls',
    setActiveApp: () => {
        console.warn('setActiveApp called outside of AppProvider');
    },
});

export const AppProvider = ({children}) => {
    // Initialize activeApp from localStorage, default to 'sls' if not set
    const [activeApp, setActiveApp] = useState(() => {
        return localStorage.getItem('activeApp') || 'sls';
    });

    // Add a state to track when the app changes
    const [appJustChanged, setAppJustChanged] = useState(false);

    // Wrap the original setActiveApp to track changes
    const handleSetActiveApp = (newApp) => {
        if (newApp !== activeApp) {
            setActiveApp(newApp);
            setAppJustChanged(true);
        }
    };

    // Persist activeApp to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('activeApp', activeApp);
    }, [activeApp]);

    return (
        <AppContext.Provider value={{
            activeApp,
            setActiveApp: handleSetActiveApp,
            appJustChanged,
            setAppJustChanged
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};