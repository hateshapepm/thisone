import React, {useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useAppContext} from '../context/AppContext';

const TogglePanel = ({slsPages, deeperPages}) => {
    const {page} = useParams();
    const navigate = useNavigate();
    const {activeApp, appJustChanged, setAppJustChanged} = useAppContext();

    console.log('Current page from useParams:', page);
    console.log('Available page keys:', Object.keys(activeApp === 'sls' ? slsPages : deeperPages));

    // Redirect to dashboard when app changes
    useEffect(() => {
        if (appJustChanged) {
            // Reset the flag
            setAppJustChanged(false);
            // Redirect to dashboard
            navigate('/');
        }
    }, [appJustChanged, navigate, setAppJustChanged]);

    // Ensure the route matches the active app on mount
    useEffect(() => {
        const currentAppInPath = window.location.pathname.split('/')[1];
        if (currentAppInPath && currentAppInPath !== activeApp && !appJustChanged) {
            const defaultPage = activeApp === 'sls' ? 'working-credentials' : 'asn';
            navigate(`/${activeApp}/${defaultPage}`);
        }
    }, [activeApp, navigate, appJustChanged]);

    // Determine which pages to render based on the active app
    const pages = activeApp === 'sls' ? slsPages : deeperPages;

    // Use the page parameter directly as the pageKey, fallback to default if not found
    const pageKey = page || (activeApp === 'sls' ? 'working-credentials' : 'asn');
    const currentPage = pages[pageKey] || <div>Page not found</div>;

    return (
        <div className="toggle-panel">
            {/* Render the current page */}
            <div className="content">{currentPage}</div>
        </div>
    );
};

export default TogglePanel;