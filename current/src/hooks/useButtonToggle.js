// src/hooks/useButtonToggle.js
import { useState } from 'react';

const useButtonToggle = (defaultButtonId = '') => {
  const [activeButtonId, setActiveButtonId] = useState(defaultButtonId);

  const handleButtonClick = (buttonId, originalOnClick) => {
    setActiveButtonId(buttonId);
    if (originalOnClick) {
      originalOnClick();
    }
  };

  return { activeButtonId, handleButtonClick };
};

export default useButtonToggle;
