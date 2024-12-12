import { toast } from "react-toastify";
import { files as fileApi } from "../api/assistant";

// Infer the filename from a given annotation of a content message
// for a message object in the Assistant domain
export const extractFilenameFromAnnotation = (annotation) => {
  if (!annotation) return null;

  if (annotation.type === "file_path" && annotation.text) {
    const path = annotation.text;
    const filename = path.split("/").pop(); // Extract the part after the last '/'
    return filename || null;
  }
  return null;
};

// Check for generated files (attachments) and store any file as a temp
// file into local file cached data, for immediate UI feedback
export const updateCache = async (message, files, queryClient) => {

  if (message?.attachments?.length) {

    for (const attachment of message.attachments) {
      if (attachment?.file_id) {
        // Control first if file is already present in the cache
        // as it could be generated in different types of stream event
        if (files.find((file) => file.id === attachment.file_id)) {
          continue;
        }
        // Extract filename from content.text.annotations
        const fileName = extractFilenameFromAnnotation(
          message.content?.[0]?.text?.annotations
        );

        // Temp file
        const mockFile = {
          id: attachment.file_id,
          bytes: 1,
          object: "file",
          purpose: "assistant_output",
          created_at: Math.floor(Date.now() / 1000),
          filename: fileName || "unknown_file",
        };

        // Update the local cache for immediate UI feedback
        queryClient.setQueryData(["files"], (oldData) => [
          ...(oldData || []),
          mockFile,
        ]);

        try {
          // Trigger file retrieval directly
          const fileData = await fileApi.retrieve(attachment.file_id);

          // Update the cache with actual file data
          queryClient.setQueryData(["files"], (oldData) =>
            (oldData || []).map((file) =>
              file.id === attachment.file_id ? fileData : file
            )
          );
        } catch (error) {
          console.error("Error retrieving file:", error);
          toast.error("Could not retrieve the file name. Please reload the page.")
        }
      }
    }
  }
};
