import React, { createContext, useState } from "react";
import chatService from "../services/chatService";

export const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
  const [activeConversation, setActiveConversation] = useState(null);

  const activateConversation = async (id) => {
    const response = await chatService.getConversation(id);
    setActiveConversation(response);
  };

  return (
    <ConversationContext.Provider
      value={{
        activeConversation,
        activateConversation,
        setActiveConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};
