import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import AddIcon from "@mui/icons-material/Add";
import { Divider, useTheme } from "@mui/material";
import FileSearchAddDialog from "./FileSearchAddDialog";

const FileInputMenu = ({
  closeMenu,
  handleAttach,
  uploadedFiles,
  setUploadedFiles,
}) => {
  // File Search Dialog state
  const [addFilesOpen, setAddFilesOpen] = useState(false);
  const addFilesDialogOpen = () => {
    setAddFilesOpen(true);
  };
  const addFilesDialogClose = () => {
    setAddFilesOpen(false);
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
          onClick={addFilesDialogOpen}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: 0.5,
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
          onClick={() => {}}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingY: 0.5,
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
      <FileSearchAddDialog
        openDialog={addFilesOpen}
        handleClose={addFilesDialogClose}
        closeMenu={closeMenu}
        handleAttach={handleAttach}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
      />
    </Paper>
  );
};

export default FileInputMenu;
