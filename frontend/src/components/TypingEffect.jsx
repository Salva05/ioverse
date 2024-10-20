import React from "react";
import "../styles/TypingEffect.css";

const TypingEffect = () => {
  return (
    <div className="typing-indicator">
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
