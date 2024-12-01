import React, { createContext, useState, useContext, useEffect } from "react";
import { useAssistantsData } from "../hooks/assistant/useAssistantsData";
import { useThreadsData } from "../hooks/assistant/useThreadsData";
import { useVectorStoresData } from "../hooks/assistant/useVectorStoresData";
import { useFilesData } from "../hooks/assistant/useFilesData";
export const AssistantContext = createContext();

export const useAssistantContext = () => useContext(AssistantContext);

export const AssistantProvider = ({ children }) => {
  // Actual data from backend
  const {
    data: assistants = [],
    isLoading: isAssistantsLoading,
    isError: isAssistantsError,
  } = useAssistantsData();

  const {
    data: threads = [],
    isLoading: isThreadsLoading,
    isError: isThreadsError,
  } = useThreadsData();

  const {
    data: vectorStores = [],
    isLoading: isVectorStoresLoading,
    isError: isVectorStoresError,
  } = useVectorStoresData();

  const {
    data: files = [],
    isLoading: isFilesLoading,
    isError: isFilesError,
  } = useFilesData();

  // Current active Tab and Entity (Domain Model)
  const [selectedTab, setSelectedTab] = useState("Settings");
  const [selectedEntity, setSelectedEntity] = useState("Assistant");

  // Current active Assistant (as Object)
  const [assistant, setAssistant] = useState(null);

  // Current active Thread (as Object)
  const [thread, setThread] = useState(null); // On mount Entity defaults to Assistant

  // Current Vector Store for the active Assistant (as Object)
  const [vectorStore, setVectorStore] = useState(null);

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

  // Track the presence of items for the given selected entity
  const [hasItems, setHasItems] = useState(null);
  useEffect(() => {
    const items = selectedEntity === "Assistant" ? assistants : threads;
    const hasItemsNow = items.length > 0;
  
    if (hasItems !== hasItemsNow) {
      setHasItems(hasItemsNow);
      setSelectedTab(hasItemsNow ? "Settings" : "Create");
    }
  }, [assistants, threads, selectedEntity]);

  const contextValue = {
    selectedTab,
    setSelectedTab,
    selectedEntity,
    setSelectedEntity,
    hasItems,
    setHasItems,
    assistant,
    setAssistant,
    assistants,
    isAssistantsLoading,
    isAssistantsError,
    threads,
    isThreadsLoading,
    isThreadsError,
    thread,
    setThread,
    vectorStores,
    isVectorStoresLoading,
    isVectorStoresError,
    vectorStore,
    setVectorStore,
    files,
    isFilesLoading,
    isFilesError,
  };

  return (
    <AssistantContext.Provider value={contextValue}>
      {children}
    </AssistantContext.Provider>
  );
};
