// ConversationContext.js
import React, { createContext, useState } from "react";
import chat from "../api/chat";
import { useQueryClient } from "@tanstack/react-query";

export const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
  const [activeConversation, setActiveConversation] = useState(null);
  const queryClient = useQueryClient();

  const activateConversation = async (id) => {
    // Attempt to get the conversation from the cache first
    const cachedConversations = queryClient.getQueryData(["conversations"]);
    const conversation = cachedConversations?.results.find(
      (conv) => conv.id === id
    );

    if (conversation) {
      setActiveConversation(conversation);
    } else {
      // If not in cache, fetch from the server
      const response = await chat.getConversation(id);
      setActiveConversation(response);
    }
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
