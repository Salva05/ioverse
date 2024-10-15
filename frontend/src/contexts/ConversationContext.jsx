import React, { createContext, useState } from "react";

export const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
  const [activeConversation, setActiveConversation] = useState(null);

  const activateConversation = (conversation) => {
    setActiveConversation(conversation);
  };

  const addMessageToActiveConversation = (newMessage) => {
    if (!activeConversation) return;

    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, newMessage],
    };

    setActiveConversation(updatedConversation);
  };

  return (
    <ConversationContext.Provider
      value={{
        activeConversation,
        activateConversation,
        addMessageToActiveConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};
