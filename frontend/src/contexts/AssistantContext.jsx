import React, { createContext, useState, useContext, useEffect } from "react";
import { useAssistantsData } from "../hooks/assistant/useAssistantsData";
import { useThreadsData } from "../hooks/assistant/useThreadsData";
import { useVectorStoresData } from "../hooks/assistant/useVectorStoresData";
import { useFilesData } from "../hooks/assistant/useFilesData";
export const AssistantContext = createContext();

export const useAssistantContext = () => useContext(AssistantContext);

export const AssistantProvider = ({ children }) => {
  // Actual data from backend
  const { data: assistants = [] } = useAssistantsData();
  const { data: threads = [] } = useThreadsData();
  const { data: vectorStores = [] } = useVectorStoresData();
  const { data: files = [] } = useFilesData();

  // Current active Tab and Entity (Domain Model)
  const [selectedTab, setSelectedTab] = useState("Settings");
  const [selectedEntity, setSelectedEntity] = useState("Assistant");

  // Current active Assistant (as Object)
  const [assistant, setAssistant] = useState(null);

  // Current active Thread (as Object)
  const [thread, setThread] = useState(null); // On mount Entity defaults to Assistant

  // Current Vector Store for the active Assistant (as Object)
  const [vectorStore, setVectorStore] = useState(null);

  // Assistant Update
  useEffect(() => {
    if (!assistants || assistants.length === 0) {
      setAssistant(null);
      setVectorStore(null);
    } else {
      // Check if current assistant exists in the new assistants data
      const updatedAssistant = assistants.find((a) => a.id === assistant?.id);

      if (updatedAssistant) {
        setAssistant(updatedAssistant); // Update
      } else {
        // Select latest assistant
        const latestAssistant = assistants.reduce((latest, current) => {
          return current.created_at > latest.created_at ? current : latest;
        });
        setAssistant(latestAssistant);
      }
    }
  }, [assistants]);

  // Vector Store Update
  useEffect(() => {
    if (!assistant || !vectorStores) {
      setVectorStore(null);
      return;
    }
    const vectorStoreId =
      assistant.tool_resources?.file_search?.vector_store_ids?.[0];
    if (vectorStoreId) {
      const associatedVectorStore = vectorStores.find(
        (vs) => vs.id === vectorStoreId
      );
      setVectorStore(associatedVectorStore || null);
      return;
    }
    setVectorStore(null);
  }, [assistant, vectorStores]);

  const contextValue = {
    selectedTab,
    setSelectedTab,
    selectedEntity,
    setSelectedEntity,
    assistant,
    setAssistant,
    thread,
    setThread,
    vectorStores,
    vectorStore,
    setVectorStore,
    files,
  };

  return (
    <AssistantContext.Provider value={contextValue}>
      {children}
    </AssistantContext.Provider>
  );
};
