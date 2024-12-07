import { useRef, useState } from "react";
import { useAssistantContext } from "../../../contexts/AssistantContext";
import { useCreateFile } from "../useCreateFile";
import { v4 as uuidv4 } from "uuid";
import { useDeleteFile } from "../useDeleteFile";

const useInputLogic = (createThread, createMessage, handleImageMenuClose) => {
  const { thread, setThread } = useAssistantContext();
  const { mutateAsync: createFile } = useCreateFile();
  const { mutate: deleteFile } = useDeleteFile();

  const textFieldRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [message, setMessage] = useState("");

  // For image attachment
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const validate = () => {
    if (!message.trim()) return;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddMessage();
    } else if (
      (e.key === "Backspace" || e.key === "Delete") &&
      selectedFiles.length > 0
    ) {
      const input = textFieldRef.current;
      if (input) {
        const selectionStart = input.selectionStart;
        const selectionEnd = input.selectionEnd;
        const value = input.value;

        // For Backspace: Check if cursor is at the start
        // For Delete: Check if cursor is at the end
        if (
          (e.key === "Backspace" &&
            selectionStart === 0 &&
            selectionEnd === 0) ||
          (e.key === "Delete" &&
            selectionStart === value.length &&
            selectionEnd === value.length)
        ) {
          e.preventDefault();
          // Remove the last file in the array
          setSelectedFiles((prevFiles) => prevFiles.slice(0, -1));
          setPreviewImages((prevUrls) => prevUrls.slice(0, -1));
        }
      }
    }
  };

  const handleRun = () => {
    validate();
    console.log("You wrote: " + message);
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleBoxClick = (event) => {
    const target = event.target;
    if (target.closest(".MuiIconButton-root") || target.closest("button")) {
      return;
    }
    if (textFieldRef.current) {
      textFieldRef.current.focus();
      setIsFocused(true);
    }
  };

  const handleFocusOut = () => {
    setIsFocused(false);
  };

  const handleAddMessage = async () => {
    let tempThread = thread;

    // Handle thread creation and activation
    if (!tempThread) {
      try {
        tempThread = await createThread();
        setThread(tempThread);
      } catch (error) {
        console.log(error);
      }
    }
    // Handle message creation and thread update (both operaitons are managed just by thraed craetion)
    // (since each message is coupled to a thread id, but thread object has no message attached)
    try {
      let content = message;

      // Case of uploaded images
      if (previewImages && previewImages.length > 0) {
        content = previewImages.map((image) => ({
          type: "image_file",
          image_file: { file_id: image.data.id, detail: "auto" },
        }));

        // insert text content
        if (message) {
          content.push({ type: "text", text: message });
        }
      }

      // The message object as per defined in the API documentation
      const ApiMessage = {
        thread_id: tempThread.id,
        role: "user",
        content: content, // Either text or an array of image objects
      };

      createMessage({ threadId: tempThread.id, message: ApiMessage });

      // Clean up resources
      previewImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
      setPreviewImages([]);
      setSelectedFiles([]);
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.filter((file) =>
        ["image/jpeg", "image/jpg", "image/gif", "image/png"].includes(
          file.type
        )
      );

      const newPreviews = newFiles.map((file) => {
        const id = uuidv4();
        const previewEntry = {
          id,
          url: URL.createObjectURL(file),
          status: "loading",
          data: null,
        };
        handleCreateFile(id, file, file, null); // Initiate upload
        return previewEntry;
      });

      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setPreviewImages((prevUrls) => [...prevUrls, ...newPreviews]);

      handleImageMenuClose();
      e.target.value = null;
    }
  };

  const handleDeleteImage = (index, fileId) => {
    const imageToDelete = previewImages[index];
    if (imageToDelete) {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(imageToDelete.url);
    }
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviewImages((prevUrls) => prevUrls.filter((_, i) => i !== index));

    deleteFile(fileId);
  };

  const handleCreateFile = async (
    id,
    file,
    imageFile = null,
    imageUrl = null
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", "vision");

    // Conditionally append image_file if provided
    if (imageFile) {
      formData.append("image_file", imageFile);
    }

    // Conditionally append image_url if provided
    if (imageUrl) {
      formData.append("image_url", imageUrl);
    }

    try {
      const data = await createFile(formData);

      // Update the file's status to 'success' and store any returned data
      setPreviewImages((prevFiles) =>
        prevFiles.map((entry) =>
          entry.id === id ? { ...entry, status: "success", data: data } : entry
        )
      );
    } catch (error) {
      console.error("File upload error:", error);
      setPreviewImages((prevFiles) =>
        prevFiles.map((entry) =>
          entry.id === id ? { ...entry, status: "error" } : entry
        )
      );
    }
  };

  return {
    textFieldRef,
    isFocused,
    setIsFocused,
    message,
    setMessage,
    previewImages,
    handleRun,
    validate,
    handleKeyPress,
    handleChange,
    handleBoxClick,
    handleFocusOut,
    handleAddMessage,
    handleFileSelect,
    selectedFiles,
    handleDeleteImage,
  };
};

export default useInputLogic;
