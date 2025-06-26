import {
  Box,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Collapse,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import ConversationItem from "./ConversationItem";

const ConversationGroup = ({
  group,
  convs,
  isOpen,
  onToggle,
  onConversationClick,
  theme,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      {/* Group Header */}
      <ListItemButton
        onClick={() => onToggle(group)}
        sx={{
          pl: 2,
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
          "& *": {
            fontFamily: "'Montserrat', serif",
          },
        }}
      >
        <ListItemText
          primary={
            <Typography variant="subtitle2" color="text.secondary">
              {group}
            </Typography>
          }
        />
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Divider sx={{ mb: 1 }} />

      {/* Collapsible Conversations */}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        {convs.map((conv) => (
          <ConversationItem
            key={conv.id}
            conv={conv}
            onClick={onConversationClick}
            theme={theme}
          />
        ))}
      </Collapse>
    </Box>
  );
};

export default ConversationGroup;
