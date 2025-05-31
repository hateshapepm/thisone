import { useEffect } from 'react';

const useEscapeToClose = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
};

export default useEscapeToClose; 