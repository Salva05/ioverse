import React, { createContext, useState, useContext, useEffect } from "react";
import { useAssistantsData } from "../hooks/assistant/useAssistantsData";
import { useThreadsData } from "../hooks/assistant/useThreadsData";

export const AssistantContext = createContext();

export const useAssistantContext = () => useContext(AssistantContext);

export const AssistantProvider = ({ children }) => {
  // Actual data from backend
  const { data: assistants } = useAssistantsData();
  const { data: threads } = useThreadsData();

  // Current active Tab and Entity (Domain Model)
  const [selectedTab, setSelectedTab] = useState("Settings")
  const [selectedEntity, setSelectedEntity] = useState("Assistant");

  // Current active Assistant (as Object)
  const [assistant, setAssistant] = useState(() => {
    if (!assistants || assistants.length === 0) return null;
    return assistants.reduce((latest, current) => {
      return current.created_at > latest.created_at ? current : latest;
    });
  });

  // Current active Thread (as Object)
  const [thread, setThread] = useState(null); // On mount Entity defaults to Assistant
  
  const contextValue = {
    selectedTab,
    setSelectedTab,
    selectedEntity,
    setSelectedEntity,
    assistant,
    setAssistant,
    thread,
    setThread
  };

  return (
    <AssistantContext.Provider value={contextValue}>
      {children}
    </AssistantContext.Provider>
  );
};
