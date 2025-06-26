import { useState } from "react";
import { List, Typography, LinearProgress, Box } from "@mui/material";
import ConversationGroup from "./ConversationGroup";

const ConversationList = ({
  groupedConversations,
  isLoading,
  onConversationClick,
  theme,
}) => {
  const [openGroups, setOpenGroups] = useState({});

  const handleGroupToggle = (group) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  return (
    <List>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <LinearProgress />
        </Box>
      ) : Object.keys(groupedConversations).length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontFamily: "'Montserrat', serif" }}
        >
          No conversations found.
        </Typography>
      ) : (
        Object.entries(groupedConversations).map(([group, convs]) => (
          <ConversationGroup
            key={group}
            group={group}
            convs={convs}
            isOpen={openGroups[group]}
            onToggle={handleGroupToggle}
            onConversationClick={onConversationClick}
            theme={theme}
          />
        ))
      )}
    </List>
  );
};

export default ConversationList;
