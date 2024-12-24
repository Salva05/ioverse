import React, { useContext } from "react";
import { Box, Tooltip, Typography, useTheme } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useAssistantContext } from "../../../../../contexts/AssistantContext";
import { TbFileDatabase } from "react-icons/tb";
import { DrawerContext } from "../../../../../contexts/DrawerContext";
import { truncateText } from "../../../../../utils/textUtils";
import { formatFileSize } from "../../../../../utils/formatFileSize";
import AddIcon from "@mui/icons-material/Add";

const VectorStores = ({ file, setFile, lockedFile, setLockedFile }) => {
  const { vectorStores } = useAssistantContext();
  const theme = useTheme();
  const { isSmallScreen } = useContext(DrawerContext);

  return (
    <>
      {vectorStores && vectorStores.length > 0 ? (
        vectorStores.map((currentStore) => (
          <Box
            key={currentStore.id}
            className="store-item"
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              paddingX: 2,
              paddingY: 1,
              boxShadow: theme.shadows[1],
              backgroundColor:
                lockedFile?.id === currentStore.id
                  ? theme.palette.action.selected
                  : file?.id === currentStore.id
                  ? theme.palette.action.hover
                  : theme.palette.background.paper,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
              cursor: "pointer",
              transition: `
    background-color 0.3s ease-in-out, 
    border-color 0.3s ease-in-out, 
    box-shadow 0.3s ease-in-out, 
    transform 0.3s ease-in-out
  `,
              "& *": {
                fontFamily: "'Montserrat', serif",
              },
              "&:hover": {
                boxShadow: theme.shadows[4],
                transform: "scale(1.05)",
                transformOrigin: "center",
              },
              willChange: "transform",
              alignSelf: "flex-start",
              height: "auto",
              minWidth: "150px",
            }}
            onMouseEnter={() => {
              if (!lockedFile) {
                setFile(currentStore); // Update the file state only if no file (yes, file is used btoh for vector stores and classis files) is locked
              }
            }}
            onClick={() => {
              if (lockedFile?.id === currentStore.id) {
                setLockedFile(null); // Unlock the file if it's already locked
              } else {
                setLockedFile(currentStore); // Lock the file on click
              }
            }}
          >
            {/* File Icon */}
            <InsertDriveFileIcon
              sx={{
                fontSize: isSmallScreen ? 30 : 45,
                color: theme.palette.primary.main,
                marginBottom: isSmallScreen ? 0.2 : 1,
              }}
            />

            {/* Filename */}
            <Typography
              variant="body1"
              gutterBottom
              sx={{ fontSize: isSmallScreen ? "1rem" : "1.1rem" }}
            >
              {truncateText(currentStore?.filename || currentStore.id, 10)}
            </Typography>

            {/* File Details */}
            <Box sx={{ width: "100%", mt: isSmallScreen ? 0.7 : 1 }}>
              <Tooltip title="Store size">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TbFileDatabase
                    style={{
                      marginRight: 8,
                      color: theme.palette.primary.main,
                      fontSize: isSmallScreen ? "1.1rem" : "1.3rem",
                    }}
                    aria-label="File Size Icon"
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: isSmallScreen ? "0.8rem" : "0.85rem" }}
                  >
                    {formatFileSize(currentStore.usage_bytes)}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          </Box>
        ))
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%", // Full height of the container
            textAlign: "center",
            gap: 1.5,
            color: "text.secondary",
          }}
        >
          {/* File Icon */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: 48,
              height: 48,
              borderRadius: "8px",
              backgroundColor: "action.disabledBackground",
              color: "text.primary",
              mb: 1,
            }}
          >
            <InsertDriveFileIcon sx={{ fontSize: 30 }} />
          </Box>

          {/* Text */}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              fontFamily: "'Montserrat', serif",
            }}
          >
            Create a vector store
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: "'Montserrat', serif", maxWidth: "500px" }}
          >
            Vector stores allow Assistants to search information in your
            documents using the File Search tool.
          </Typography>

          {/* Button */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              onClick={() => alert("Pippo")}
              sx={{
                backgroundColor: theme.palette.success.light,
                color: "primary.contrastText",
                px: 1.3,
                py: 0.5,
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                textTransform: "none",
                textDecoration: "none",
                fontWeight: "medium",
                fontFamily: "'Montserrat', serif",
                alignItems: "center",
                justifyContent: "center",
                display: "inline-flex",
                "&:hover": {
                  backgroundColor: theme.palette.success.dark,
                },
              }}
            >
              Create
              <AddIcon sx={{ fontSize: "1rem" }} />
            </Box>
            <Box
              component="a"
              href="https://platform.openai.com/docs/api-reference/vector-stores"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "primary.main",
                px: 1.5,
                py: 0.5,
                cursor: "pointer",
                textTransform: "none",
                textDecoration: "none",
                fontWeight: "medium",
                display: "inline-block",
                fontFamily: "'Montserrat', serif",
                fontSize: "0.8rem",
              }}
            >
              Learn about vector stores
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default VectorStores;
