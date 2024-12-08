import { useRef, useState } from "react";
import { useAssistantContext } from "../../../contexts/AssistantContext";
import { useCreateFile } from "../useCreateFile";
import { v4 as uuidv4 } from "uuid";
import { useDeleteFile } from "../useDeleteFile";
import { toast } from "react-toastify";

const useInputLogic = (createThread, createMessage, handleImageMenuClose) => {
  const { thread, setThread } = useAssistantContext();
  const { mutateAsync: createFile } = useCreateFile();
  const { mutate: deleteFile } = useDeleteFile();

  const textFieldRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [message, setMessage] = useState("");

  // For File Search
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);

  // For image attachment
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

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

  // For image insertion by URL
  const handleInsertImageFromUrl = (url) => {
    const id = uuidv4();
    const newPreview = {
      id,
      url,
      status: "success",
      data: null,
      isFromUrl: true,
    };

    // Update preview images state
    setPreviewImages((prev) => [...prev, newPreview]);

    // Close the image menu (if necessary)
    handleImageMenuClose();
  };

  const handleAddMessage = async () => {
    if (!message.trim()) {
      toast.error("The message must have a non-empty content.");
      return;
    }

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
        content = previewImages.map((image) => {
          if (image.isFromUrl) {
            return {
              type: "image_url",
              image_url: { url: image.url, detail: "auto" },
            };
          } else {
            return {
              type: "image_file",
              image_file: { file_id: image.data.id, detail: "auto" },
            };
          }
        });

        // insert text content
        if (message) {
          content.push({ type: "text", text: message });
        }
      }

      // Case of uploaded files
      let attachments = [];
      if (previewFiles && previewFiles.length > 0) {
        attachments = previewFiles.map((file) => {
          return {
            file_id: file.id,
            tools: [
              {
                type: file.type,
              },
            ],
          };
        });
      }

      // The message object as per defined in the API documentation
      const ApiMessage = {
        thread_id: tempThread.id,
        role: "user",
        content: content,
        attachments: attachments,
      };

      createMessage({ threadId: tempThread.id, message: ApiMessage });

      // Clean up for Images
      previewImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
      setPreviewImages([]);
      setSelectedFiles([]);

      // Clean up for files
      setPreviewFiles([]);
      setUploadedFiles([]);

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
          isFromUrl: false,
        };
        handleCreateFile(id, file); // Initiate upload
        return previewEntry;
      });

      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setPreviewImages((prevUrls) => [...prevUrls, ...newPreviews]);

      handleImageMenuClose();
      e.target.value = null;
    }
  };

  const handleDeleteImage = (index, fileId, shouldDelete = false) => {
    const imageToDelete = previewImages[index];
    if (imageToDelete) {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(imageToDelete.url);
    }
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviewImages((prevUrls) => prevUrls.filter((_, i) => i !== index));

    if (shouldDelete) deleteFile(fileId);
  };

  const handleDeleteFile = (fileId) => {
    setPreviewFiles((prevFiles) =>
      prevFiles.filter((file) => file.id !== fileId)
    );
    setUploadedFiles((prevUploads) =>
      prevUploads.filter((file) => file?.data?.id !== fileId)
    );
    deleteFile(fileId);
  };

  const handleChangeFileType = (type, id) => {
    const newPreviewFiles = previewFiles.map((file) =>
      file.id === id ? { ...file, type: type } : file
    );
    setPreviewFiles(newPreviewFiles);
  };

  const handleCreateFile = async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", "vision");

    if (file) {
      formData.append("image_file", file);
    }

    try {
      const data = await createFile(formData);

      // Update the file's status to 'success'
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

  // Load the files to attach to file search to internal state
  const handleAttach = (event, type) => {
    event.preventDefault();

    const files = uploadedFiles
      .filter((file) => file.status === "success") // Filter out unsuccessful uploads
      .map((file) => ({
        id: file.data.id,
        type: type, // 'file_search' or 'code_interpreter'
        filename: file.data.filename,
      }));

    setPreviewFiles(files);
  };

  return {
    textFieldRef,
    isFocused,
    setIsFocused,
    message,
    setMessage,
    previewImages,
    previewFiles,
    handleRun,
    handleKeyPress,
    handleChange,
    handleBoxClick,
    handleFocusOut,
    handleAddMessage,
    handleFileSelect,
    selectedFiles,
    handleDeleteImage,
    handleInsertImageFromUrl,
    handleAttach,
    uploadedFiles,
    setUploadedFiles,
    handleDeleteFile,
    handleChangeFileType,
  };
};

export default useInputLogic;
