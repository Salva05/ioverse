import React, { useRef } from "react";
import {
  useTheme,
  useMediaQuery,
  Box,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Button,
} from "@mui/material";
import { InsertDriveFileOutlined, Add } from "@mui/icons-material";
import { GoTrash } from "react-icons/go";

const FileListContent = ({
  handleDragOver,
  handleDrop,
  uploadedFiles,
  handleRemoveFile,
  handleFiles,
  isMobile,
  isTablet,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
        minWidth: isMobile ? "248px" : isTablet ? "375px" : "462px",
        maxWidth: "462px",
        minHeight: "412px",
      }}
    >
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table
          size="small"
          sx={{
            tableLayout: "auto",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  borderBottom: "none",
                  padding: "4px 2px",
                  fontSize: {
                    xs: "0.7rem",
                    sm: "0.75rem",
                  },
                  fontFamily: "'Montserrat', serif",
                  whiteSpace: "nowrap",
                }}
              >
                FILE
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: "bold",
                  borderBottom: "none",
                  padding: "4px 10px",
                  fontSize: {
                    xs: "0.7rem",
                    sm: "0.75rem",
                  },
                  fontFamily: "'Montserrat', serif",
                  whiteSpace: "nowrap",
                }}
              >
                SIZE
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  fontWeight: "bold",
                  borderBottom: "none",
                  padding: "4px 8px",
                  fontSize: {
                    xs: "0.7rem",
                    sm: "0.75rem",
                  },
                  fontFamily: "'Montserrat', serif",
                  whiteSpace: "nowrap",
                }}
              >
                UPLOADED
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  borderBottom: "none",
                  padding: "4px 0px",
                  whiteSpace: "nowrap",
                }}
              ></TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4} sx={{ padding: 0, borderBottom: "none" }}>
                <Box
                  sx={{
                    width: "99%",
                    margin: "0 auto",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uploadedFiles.map(({ file, uploadedAt }, index) => (
              <TableRow key={index}>
                <TableCell
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "none",
                    padding: "8px 0px",
                    whiteSpace: isSmallScreen ? "normal" : "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: isMobile ? "120px" : isTablet ? "160px" : "220px",
                  }}
                >
                  <InsertDriveFileOutlined
                    fontSize="small"
                    sx={{
                      marginRight: "4px",
                      color:
                        theme.palette.mode === "light"
                          ? theme.palette.grey[700]
                          : theme.palette.grey[400],
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "'Montserrat', serif",
                      fontSize: {
                        xs: "0.7rem",
                        sm: "0.75rem",
                      },
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {file.name}
                  </Typography>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    borderBottom: "none",
                    padding: "4px 10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "'Montserrat', serif",
                      fontSize: {
                        xs: "0.7rem",
                        sm: "0.75rem",
                      },
                    }}
                  >
                    {(file.size / 1024).toFixed(2)} KB
                  </Typography>
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    borderBottom: "none",
                    padding: "4px 8px",
                    whiteSpace: isSmallScreen ? "normal" : "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "'Montserrat', serif",
                      fontSize: {
                        xs: "0.7rem",
                        sm: "0.75rem",
                      },
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {uploadedAt}
                  </Typography>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    borderBottom: "none",
                    padding: "4px 10px",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <GoTrash size="1rem" style={{ color:
                        theme.palette.mode === "light"
                          ? theme.palette.grey[700]
                          : theme.palette.grey[400],}}/>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        variant="outlined"
        fullWidth
        startIcon={<Add />}
        onClick={handleFileUploadClick}
        sx={{
          marginTop: "16px",
          borderRadius: "15px",
          textTransform: "none",
          fontFamily: "'Montserrat', serif",
          borderColor:
            theme.palette.mode === "dark"
              ? theme.palette.grey[700]
              : theme.palette.grey[300],
          color:
            theme.palette.mode === "dark"
              ? theme.palette.grey[300]
              : theme.palette.text.primary,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        Add More Files
      </Button>
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

export default FileListContent;
