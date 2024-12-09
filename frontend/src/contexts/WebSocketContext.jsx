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

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [hasFinished, setHasFinished] = useState(false); // to signal the component the end of the stream
  const [streamMessageId, setStreamMessageId] = useState(""); // only the corresponding message in Message.jsx will apply the conditional streaming renders

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
        console.log("STREAM STARTED >>>", message.data);
        setStreamMessageId(message.data.id);
        setHasFinished(false);

        // Insert the incomplete message to the cached data to have an immediate UI update
        queryClient.setQueryData(
          ["messages", message.data.thread_id],
          (oldData) => [...(oldData || []), message.data]
        );

        break;
      case "chunk":
        // For future processing
        break;
      case "tool_call":
        console.log(`Tool call: ${message.message}`);
        break;
      case "code_input":
        console.log(`Code Input: ${message.message}`);
        break;
      case "code_output":
        console.log(`Code Output: ${message.message}`);
        break;
      case "end":
        // Update the cached query data with completed message
        console.log("STREAM ENDED >>>", message.data);
        setHasFinished(true);
        setStreamMessageId("");
        queryClient.setQueryData(
          ["messages", message.data[0].thread_id],
          (oldData) =>
            (oldData || []).map((entity) =>
              entity.id === message.data[0].id ? message.data[0] : entity
            )
        );

        break;
      case "error":
        console.error(`Error from server: ${message.message}`);
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
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
