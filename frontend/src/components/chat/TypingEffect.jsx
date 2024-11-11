import React from "react";
import "../../styles/TypingEffect.css";
import { useDarkMode } from "../../contexts/DarkModeContext";

const TypingEffect = () => {
  const { darkMode } = useDarkMode();

  return (
    <div
      className="typing-indicator"
      style={{
        "--circle-color": darkMode ? "#fff" : "#000"
      }}
    >
      <div className="typing-circle"></div>
      <div className="typing-circle"></div>
      <div className="typing-circle"></div>
      <div className="typing-shadow"></div>
      <div className="typing-shadow"></div>
      <div className="typing-shadow"></div>
    </div>
  );
};

export default TypingEffect;
