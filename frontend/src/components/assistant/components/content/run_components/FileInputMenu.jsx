import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import AddIcon from "@mui/icons-material/Add";
import { Divider, useTheme } from "@mui/material";
import FileAddDialog from "./FileAddDialog";

const FileInputMenu = ({
  closeMenu,
  handleAttach,
  uploadedFiles,
  setUploadedFiles,
}) => {
  // File Search Dialog state
  const [addFilesOpen, setAddFilesOpen] = useState(false);
  const [isFileSearch, setIsFileSearch] = useState(true);

  const openDialog = (fileSearch) => {
    setIsFileSearch(fileSearch);
    setAddFilesOpen(true);
  };
  const closeDialog = () => {
    setAddFilesOpen(false);
  };

  // boolean for disabling one of the buttons
  // forcing to upload only one type per time
  const hasAndIsFileSearch = {
    has: uploadedFiles && uploadedFiles.length > 0,
    isFileSearch: uploadedFiles[0]?.type === "file_search",
  };

  const theme = useTheme();

  const borderColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[500]
      : theme.palette.divider;

  const buttonBackgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[400]
      : theme.palette.grey[500];

  return (
    <Paper
      sx={{
        paddingX: 1,
        border: "1px solid",
        borderColor: borderColor,
      }}
    >
      <MenuList>
        <MenuItem
          onClick={() => openDialog(true)}
          disabled={hasAndIsFileSearch.has && !hasAndIsFileSearch.isFileSearch}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: 0.5,
            opacity:
              hasAndIsFileSearch.has && !hasAndIsFileSearch.isFileSearch
                ? 0.5
                : 1,
            pointerEvents:
              hasAndIsFileSearch.has && !hasAndIsFileSearch.isFileSearch
                ? "none"
                : "auto",
          }}
        >
          <ListItemText
            primary="File search"
            sx={{
              "& .MuiTypography-root": {
                fontFamily: "'Montserrat', serif",
                fontSize: "0.9rem",
              },
            }}
          />
          <AddIcon
            fontSize="small"
            sx={{
              ml: 2,
              color: theme.palette.action.active,
              backgroundColor: buttonBackgroundColor,
              borderRadius: "4px",
            }}
          />
        </MenuItem>
        <Divider sx={{ marginX: 2 }} />
        <MenuItem
          onClick={() => openDialog(false)}
          disabled={hasAndIsFileSearch.has && hasAndIsFileSearch.isFileSearch}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: 0.5,
            opacity:
              hasAndIsFileSearch.has && hasAndIsFileSearch.isFileSearch
                ? 0.5
                : 1,
            pointerEvents:
              hasAndIsFileSearch.has && hasAndIsFileSearch.isFileSearch
                ? "none"
                : "auto",
          }}
        >
          <ListItemText
            primary="Code interpreter"
            sx={{
              "& .MuiTypography-root": {
                fontFamily: "'Montserrat', serif",
                fontSize: "0.9rem",
              },
            }}
          />
          <AddIcon
            fontSize="small"
            sx={{
              ml: 2,
              color: theme.palette.action.active,
              backgroundColor: buttonBackgroundColor,
              borderRadius: "4px",
            }}
          />
        </MenuItem>
      </MenuList>
      {/* File Add Dialog */}
      <FileAddDialog
        openDialog={addFilesOpen}
        handleClose={closeDialog}
        closeMenu={closeMenu}
        handleAttach={handleAttach}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
        isFileSearch={isFileSearch}
      />
    </Paper>
  );
};

export default FileInputMenu;
