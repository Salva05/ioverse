import React, { createContext, useState } from 'react';

export const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
  const [activeConversation, setActiveConversation] = useState(null);

  const activateConversation = (conversation) => {
    setActiveConversation(conversation);
  };

  return (
    <ConversationContext.Provider
      value={{
        activeConversation,
        activateConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};
