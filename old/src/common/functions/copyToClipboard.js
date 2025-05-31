// src/functions/clipboard.js
export const copyInfoClipboard = (text, showNotification) => {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            showNotification?.('Copied to clipboard!');
        })
        .catch((err) => {
            console.error('Failed to copy: ', err);
            showNotification?.('Failed to copy to clipboard', true);
        });
};
