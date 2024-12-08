import React from "react";
import {
  MenuItem,
  Checkbox,
  Typography,
  Divider,
  ListItemIcon,
  MenuList,
  useTheme,
  Paper,
} from "@mui/material";
import { GoTrash } from "react-icons/go";

const UploadedFileMenu = ({
  handleDeleteFile,
  id,
  handleClose,
  handleChangeFileType,
  currentType,
  isSent = false,
}) => {
  const theme = useTheme();

  // State for checkbox selections
  const [fileSearchChecked, setFileSearchChecked] = React.useState(false);
  const [codeInterpreterChecked, setCodeInterpreterChecked] =
    React.useState(false);

  const handleChange = (type) => {
    switch (type) {
      case "file_search":
        if (fileSearchChecked) return;
        setCodeInterpreterChecked(false);
        setFileSearchChecked(true);
        handleChangeFileType(type, id);
        break;
      case "code_interpreter":
        if (codeInterpreterChecked) return;
        setFileSearchChecked(false);
        setCodeInterpreterChecked(true);
        handleChangeFileType(type, id);
        break;
    }
  };

  React.useEffect(() => {
    if (currentType === "file_search") {
      setFileSearchChecked(true);
      setCodeInterpreterChecked(false);
    } else if (currentType === "code_interpreter") {
      setFileSearchChecked(false);
      setCodeInterpreterChecked(true);
    }
  }, [currentType]);

  const borderColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[500]
      : theme.palette.divider;

  return (
    <Paper
      sx={{
        paddingX: 1,
        border: "1px solid",
        borderColor: borderColor,
        "& *": {
          fontFamily: "'Montserrat', serif",
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontSize: "0.8rem",
          fontFamily: "'Montserrat', serif",
          pl: 1,
          pt: 1,
        }}
      >
        File available to
      </Typography>
      <MenuList>
        {/* File Search Checkbox */}
        <MenuItem disabled={isSent} onClick={() => handleChange("file_search")}>
          <Checkbox
            checked={fileSearchChecked}
            size="small"
            sx={{
              padding: 0,
              color: fileSearchChecked ? "green" : "inherit",
            }}
          />
          <Typography
            variant="body2"
            sx={{
              marginLeft: 1,
              fontSize: "0.9rem",
              fontFamily: "'Montserrat', serif",
            }}
          >
            File search
          </Typography>
        </MenuItem>

        {/* Code Interpreter Checkbox */}
        <MenuItem
          disabled={isSent}
          onClick={() => handleChange("code_interpreter")}
        >
          <Checkbox
            checked={codeInterpreterChecked}
            size="small"
            sx={{
              padding: 0,
              color: codeInterpreterChecked ? "green" : "inherit",
            }}
          />
          <Typography
            variant="body2"
            sx={{
              marginLeft: 1,
              fontSize: "0.9rem",
              fontFamily: "'Montserrat', serif",
            }}
          >
            Code interpreter
          </Typography>
        </MenuItem>

        <Divider
          sx={{
            borderColor: "rgba(255, 255, 255, 0.2)",
            marginY: 1,
          }}
        />

        {/* Delete */}
        <MenuItem
          disabled={isSent}
          onClick={() => {
            handleClose();
            handleDeleteFile(id);
          }}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon>
            <GoTrash color={theme.palette.error.main} />
          </ListItemIcon>
          <Typography
            variant="body2"
            sx={{ fontSize: "0.9rem", fontFamily: "'Montserrat', serif" }}
          >
            Delete
          </Typography>
        </MenuItem>
      </MenuList>
    </Paper>
  );
};

export default UploadedFileMenu;
