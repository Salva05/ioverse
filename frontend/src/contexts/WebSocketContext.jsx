import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";
import { getAccessToken } from "../utils/getAccessToken";
import { toast } from "react-toastify";
import config from "../config";
import { useQueryClient } from "@tanstack/react-query";
import { updateCache } from "../utils/fileGenerationUtils";
import { useAssistantContext } from "./AssistantContext";
export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { files } = useAssistantContext();

  const [hasFinished, setHasFinished] = useState(true); // Signals the component the end of the stream
  const [streamMessageId, setStreamMessageId] = useState(""); // only the corresponding message in Message.jsx will apply the conditional streaming renders
  const [toolCall, setToolCall] = useState("");

  const { isAuthenticated } = useContext(AuthContext);
  const ws = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("DISCONNECTED");

  // Reconnection settings
  const reconnectInterval = useRef(1000); // Start with 1s
  const maxReconnectInterval = 30000; // Max 30s

  // Ref to hold message listeners
  const messageListeners = useRef([]);

  const connect = async () => {
    if (!isAuthenticated) return;

    try {
      // Get the access token
      const token = await getAccessToken();
      // Construct server url
      const baseUrl = config.VITE_BASE_DOMAIN_URL;

      ws.current = new WebSocket(
        `${baseUrl}/ws/assistant/stream?token=${token}`
      );
      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setConnectionStatus("CONNECTED");
        reconnectInterval.current = 1000; // Reset reconnection interval
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleMessage(message);
      };

      ws.current.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
        setConnectionStatus("DISCONNECTED");
        if (event.code !== 1000) {
          // Abnormal closure
          attemptReconnect();
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.current.close();
      };
    } catch (error) {
      toast.error("Failed to retrieve credentials.");
      console.error(
        "Error while establishing the websocket connection:",
        error
      );
    }
  };

  const disconnect = () => {
    if (ws.current) {
      ws.current.close(1000, "Client disconnecting");
    }
  };

  const attemptReconnect = () => {
    setTimeout(() => {
      if (reconnectInterval.current < maxReconnectInterval) {
        reconnectInterval.current *= 2; // Exponential backoff
      }
      console.log(`Attempting to reconnect...`);
      connect();
    }, reconnectInterval.current);
  };

  const handleMessage = (message) => {
    // Message routing based on type
    switch (message.type) {
      case "start":
        console.log("STREAM STARTED >>>", message.message);
        setHasFinished(false);
        setToolCall("");
        break;
      case "chunk":
        // For future processing
        break;
      case "message_creation":
        console.log("MESSAGE CREATED >>>", message.data);

        setStreamMessageId(message.data.id);
        setHasFinished(false);

        // Add message snapshot
        queryClient.setQueryData(
          ["messages", message.data.thread_id],
          (oldData) => [...(oldData || []), message.data]
        );
        // If any file is generated, save a temp file and it's filename inferred from annotation file_path
        // to give instant UI feedback and then trigger a retrieval from backend to update the cache with real data
        updateCache(message.data, files, queryClient);
        break;
      case "message_done":
        console.log("MESSAGE COMPLETED >>>", message.data);
        setStreamMessageId("");
        setToolCall("");

        // Substitute snapshot message with completed one
        queryClient.setQueryData(
          ["messages", message.data.thread_id],
          (oldData) =>
            (oldData || []).map((entity) =>
              entity.id === message.data.id ? message.data : entity
            )
        );

        updateCache(message.data, files, queryClient);
        break;
      case "tool_call":
        // For future features
        console.log(`Tool call: ${message.message}`);
        switch (message.message) {
          case "code_interpreter":
            console.log("inside code_intp.");
            setToolCall("code_interpreter");
            break;
        }
        break;
      case "code_input":
        // For future features
        break;
      case "code_output":
        setToolCall("");
        console.log("Tool call completed", message);
        break;
      case "image_file_done":
        console.log("IMAGE_FILE COMPLETED >>>", message.data);
        // Update the local data with the image
        queryClient.setQueryData(
          ["messages", message.data.thread_id],
          (oldData) =>
            (oldData || []).map((entity) =>
              entity.id === message.data.id ? message.data : entity
            )
        );
        break;
      case "end":
        // Update the cached query data with completed message
        console.log("STREAM ENDED >>>", message.data);
        queryClient.setQueryData(
          ["messages", message.data[0].thread_id],
          (oldData) =>
            (oldData || []).map((entity) =>
              entity.id === message.data[0].id ? message.data[0] : entity
            )
        );
        setHasFinished(true);
        setStreamMessageId("");
        setToolCall("");
        break;
      case "error":
        console.error(`Error from server: ${message.message}`);
        setHasFinished(true);
        setStreamMessageId("");
        setToolCall("");
        break;
      default:
        console.warn(`Unhandled message type: ${message.type}`);
    }

    // Notify all registered listeners
    messageListeners.current.forEach((listener) => listener(message));
  };

  // Function to add a message listener
  const addMessageListener = (listener) => {
    messageListeners.current.push(listener);
  };

  // Function to remove a message listener
  const removeMessageListener = (listener) => {
    messageListeners.current = messageListeners.current.filter(
      (l) => l !== listener
    );
  };

  const sendMessage = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket is not open. Unable to send message:", data);
    }
  };

  useEffect(() => {
    if (isAuthenticated && connectionStatus === "DISCONNECTED") {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnect();
    }
  }, [isAuthenticated]);

  const contextValue = {
    connectionStatus,
    sendMessage,
    addMessageListener,
    removeMessageListener,
    hasFinished,
    streamMessageId,
    toolCall,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
