import React, { useState } from "react";
import {
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  TextField,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { truncateText } from "../../utils/textUtils";
import OptionsMenu from "../chat/OptionsMenu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import chat from "../../api/chat";

const ConversationItem = ({ conv, onClick, theme }) => {
  const queryClient = useQueryClient();
  const [isEditMode, setEditMode] = useState(false);

  const handleRename = () => {
    setEditMode(true);
  };

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: async ({ conversationId, new_title }) =>
      await chat.renameConversation(conversationId, new_title),
    onSuccess: (data, { conversationId, new_title }) => {
      // Update the specific conversation in the cache
      queryClient.setQueryData(["conversations"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          results: oldData.results.map((conv) =>
            conv.id === conversationId ? { ...conv, title: new_title } : conv
          ),
        };
      });
    },
    onError: (error) => {
      console.log("Error renaming the conversation:", error);
      // Extract meaningful message from the error
      const errorMessage =
        error.response?.data?.detail ||
        "An error occurred while renaming the conversation.";
      toast.error("Error renaming the conversation: " + errorMessage);
    },
  });

  const handleTitleKeyDown = (e, conversationId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTitle = e.target.value.trim();
      if (newTitle) {
        renameMutation.mutate({ conversationId, new_title: newTitle });
        setEditMode(false);
      } else {
        toast.error("Title cannot be empty.");
      }
    } else if (e.key === "Escape") {
      setEditMode(false);
    }
  };

  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={() => onClick(conv.id)}
        sx={{
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
        }}
      >
        <ListItemAvatar>
          <Avatar>{conv.title.charAt(0)}</Avatar>
        </ListItemAvatar>
        {isEditMode ? (
          <TextField
            defaultValue={conv.title}
            onKeyDown={(e) => handleTitleKeyDown(e, conv.id)}
            onBlur={() => setEditMode(false)}
            autoFocus
            size="small"
            variant="outlined"
            fullWidth
            name="conversationTitle"
            onFocus={(e) => e.stopPropagation()}
          />
        ) : (
          <ListItemText
            primary={conv.title}
            secondary={truncateText(conv.lastMessage, 50)}
          />
        )}
      </ListItemButton>
      <OptionsMenu conversationId={conv.id} onRename={handleRename} />
    </ListItem>
  );
};

export default ConversationItem;
