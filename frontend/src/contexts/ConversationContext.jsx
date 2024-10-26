import React, { createContext, useState } from "react";
import chat from "../api/chat";
import { useQueryClient } from "@tanstack/react-query";

export const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
  const [activeConversationId, setActiveConversationId] = useState(null);
  const queryClient = useQueryClient();

  const activateConversation = async (id) => {
    setActiveConversationId(id);

    // Preload the conversation into the cache if not present
    const cachedConversations = queryClient.getQueryData(["conversations"]);
    const conversation = cachedConversations?.results.find(
      (conv) => conv.id === id
    );

    if (!conversation) {
      // If not in cache, fetch from the server
      await chat.getConversation(id);
      queryClient.invalidateQueries(["conversations"]);
    }
  };

  return (
    <ConversationContext.Provider
    value={{
      activeConversationId,
      activateConversation,
      setActiveConversationId,
    }}
    >
      {children}
    </ConversationContext.Provider>
  );
};
