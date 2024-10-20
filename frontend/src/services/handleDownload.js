import chatService from "./chatService";

const handleDownload = async (conversationId) => {
  try {
    const data = await chatService.downloadConversation(conversationId);

    // Create a blob from the response data
    const blob = new Blob([data], { type: "application/pdf" });
    const downloadUrl = window.URL.createObjectURL(blob);

    // Create a link element and trigger the download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `conversation_${conversationId}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.log("Error downloading conversation", error);
  }
};

export default handleDownload;
