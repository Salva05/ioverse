import React from "react";
import {
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { truncateText } from "../../utils/textUtils";

const ConversationItem = ({ conv, onClick, theme }) => {
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
        <ListItemText
          primary={conv.title}
          secondary={truncateText(conv.lastMessage, 50)}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default ConversationItem;
