import React, { createContext, useState, useContext, useEffect } from "react";

export const AssistantContext = createContext();

export const useAssistantContext = () => useContext(AssistantContext);

export const AssistantProvider = ({ children }) => {
  const [selectedTab, setSelectedTab] = useState("Settings")
  const [selectedEntity, setSelectedEntity] = useState("Assistant");
  const [selectedItem, setSelectedItem] = useState(0);

  useEffect(() => {
    setSelectedItem(0);
  }, [selectedEntity]);
  
  const contextValue = {
    selectedTab,
    setSelectedTab,
    selectedEntity,
    setSelectedEntity,
    selectedItem,
    setSelectedItem,
  };

  return (
    <AssistantContext.Provider value={contextValue}>
      {children}
    </AssistantContext.Provider>
  );
};
