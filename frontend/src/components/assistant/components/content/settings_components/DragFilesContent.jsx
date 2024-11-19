import React, { useRef } from "react";
import { Typography, Link, useTheme, Box } from "@mui/material";
import { IoIosImages } from "react-icons/io";

const DragFilesContent = ({
  handleFiles,
  handleDragOver,
  handleDrop,
  isMobile,
  isTablet,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    handleFiles(e.target.files);
  };

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };
  
  return (
    <Box
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        minWidth: isMobile ? "248px" : isTablet ? "375px" : "450px",
        minHeight: "412px",
        px: 4,
        py: isMobile ? 4 : isTablet ? 9 : 15,
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
        },
        "& .MuiOutlinedInput-input": {
          paddingY: 1.15,
        },
      }}
    >
      <IoIosImages
        style={{
          color: theme.palette.grey[500],
          fontSize: "80px",
        }}
      />
      <Typography
        sx={{
          fontFamily: "'Montserrat', serif",
          fontSize: "0.9rem",
          my: 2,
        }}
      >
        Drag your files here or{" "}
        <Typography
          component="span"
          sx={{
            fontSize: "inherit",
            textDecoration: "none",
            color: theme.palette.primary.main,
            fontFamily: "'Montserrat', serif",
            transition: "color 0.4s ease",
            "&:hover": {
              cursor: "pointer",
              color: theme.palette.primary.dark,
            },
          }}
          onClick={handleFileUploadClick}
        >
          click to upload.
        </Typography>
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Montserrat', serif",
          fontSize: "0.8rem",
        }}
      >
        Information in attached files will be available to this assistant.
      </Typography>
      <Link
        href="https://platform.openai.com/docs/assistants/tools/file-search"
        target="_blank"
        rel="noopener"
        sx={{
          fontSize: "0.8rem",
          fontFamily: "'Montserrat', serif",
          textDecoration: "none",
          color: theme.palette.primary.main,
          "&:hover": {
            textDecoration: "underline",
          },
        }}
      >
        Learn more.
      </Link>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
    </Box>
  );
};

export default DragFilesContent;
