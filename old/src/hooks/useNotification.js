import { useState } from 'react';

export const useNotification = () => {
    const [notification, setNotification] = useState({message: '', visible: false, isError: false});

    const showNotification = (message, isError = false) => {
        setNotification({message, visible: true, isError});
        setTimeout(() => setNotification((prev) => ({...prev, visible: false})), 3000);
    };

    return { notification, showNotification };
};
