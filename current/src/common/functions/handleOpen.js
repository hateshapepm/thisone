export const handleOpen = async (url, e) => {
    try {
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
            console.error('Failed to open tab - check popup blocker');
        }
    } catch (err) {
        console.error('Failed to open URL:', err);
    }
};
