import { Box, TextField, InputAdornment } from "@mui/material";
import { getGroupLabel } from "../../utils/getGroupLabel";
import SearchIcon from "@mui/icons-material/Search";
import TabPanel from "./TabPanel";
import ConversationList from "./ConversationList";
import { useContext, useMemo, useState } from "react";
import { ConversationContext } from "../../contexts/ConversationContext";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

const ChatsSection = ({ tabValue, theme, isLoading, conversationsData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { activateConversation } = useContext(ConversationContext);
  const navigate = useNavigate();

  const handleConversationClick = (conversationId) => {
    activateConversation(conversationId);
    navigate("/chat");
  };

  const conversations = useMemo(() => {
    if (!conversationsData || !conversationsData.results) return [];

    return conversationsData.results.map((conv) => ({
      id: conv.id,
      title: conv.title,
      createdAt: parseISO(conv.created_at),
      updatedAt: parseISO(conv.updated_at),
      lastMessage:
        conv.messages && conv.messages.length > 0
          ? conv.messages[conv.messages.length - 1].message_body
          : "No messages yet.",
      userUsername: conv.user_username,
    }));
  }, [conversationsData]);

  const groupedConversations = useMemo(() => {
    const groups = {};

    conversations.forEach((conv) => {
      const groupLabel = getGroupLabel(conv.createdAt);

      if (!groups[groupLabel]) {
        groups[groupLabel] = [];
      }

      groups[groupLabel].push(conv);
    });

    return groups;
  }, [conversations]);

  const filteredGroupedConversations = useMemo(() => {
    if (!searchQuery.trim()) return groupedConversations;

    const filtered = conversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups = {};

    filtered.forEach((conv) => {
      let groupLabel = format(conv.createdAt, "MMMM dd, yyyy");

      if (isToday(conv.createdAt)) {
        groupLabel = "Today";
      } else if (isYesterday(conv.createdAt)) {
        groupLabel = "Yesterday";
      }

      if (!groups[groupLabel]) {
        groups[groupLabel] = [];
      }

      groups[groupLabel].push(conv);
    });

    return groups;
  }, [searchQuery, groupedConversations, conversations]);

  return (
    <TabPanel value={tabValue} index={1}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search Conversations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                fontFamily: "Montserrat",
              },
            },
          }}
        />

        {/* Conversations List */}
        <ConversationList
          groupedConversations={filteredGroupedConversations}
          isLoading={isLoading}
          onConversationClick={handleConversationClick}
          theme={theme}
        />
      </Box>
    </TabPanel>
  );
};

export default ChatsSection;
