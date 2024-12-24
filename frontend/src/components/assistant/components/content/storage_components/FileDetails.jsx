import { Box, Typography, Divider, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import InfoIcon from "@mui/icons-material/Info";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { TbFileDatabase } from "react-icons/tb";
import { IoIosEye } from "react-icons/io";
import { RxLapTimer } from "react-icons/rx";
import { MdTimeline } from "react-icons/md";
import { formatFileSize } from "../../../../../utils/formatFileSize";
import { truncateText } from "../../../../../utils/textUtils";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDeleteFile } from "../../../../../hooks/assistant/useDeleteFile";
import { useDeleteVectorStore } from "../../../../../hooks/assistant/useDeleteVectorStore";
import { format } from "date-fns";

const FileDetails = ({ file }) => {
  const { mutate: deleteFile, isPending } = useDeleteFile();
  const { mutate: deleteVectorStore, isPending: isVSPending } =
    useDeleteVectorStore();

  const isFile = file.object === "file";

  const fields = [
    {
      icon: <InfoIcon fontSize="small" />,
      label: isFile ? "File ID" : "Store ID",
      value: file.id,
    },
    {
      icon: <ScheduleIcon fontSize="small" />,
      label: "Created At",
      value: format(new Date(file.created_at * 1000), "MM/dd/yyyy, h:mm a"),
    },
    {
      icon: isFile ? <IoIosEye /> : <MdTimeline />,
      label: isFile ? "Purpose" : "Last Active",
      value: isFile
        ? file.purpose
        : format(new Date(file.last_active_at * 1000), "MM/dd/yyyy, h:mm a"),
    },
    !isFile && {
      icon: <RxLapTimer />,
      label: "Expiration Policy",
      value:
        file.expires_at && file.expires_at > 0
          ? format(new Date(file.expires_at * 1000), "MM/dd/yyyy, h:mm a")
          : "Never",
    },
    {
      icon: <TbFileDatabase />,
      label: "Size",
      value: formatFileSize(isFile ? file.bytes : file.usage_bytes),
    },
  ].filter(Boolean);

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete this ${
          isFile ? "file" : "vector store"
        }?`
      )
    ) {
      isFile ? deleteFile(file.id) : deleteVectorStore(file.id);
    }
  };

  const [visibleFile, setVisibleFile] = useState(file);

  useEffect(() => {
    setVisibleFile(null);
    const timeout = setTimeout(() => {
      setVisibleFile(file);
    }, 300);

    return () => clearTimeout(timeout);
  }, [file]);

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: 2,
        width: "100%",
        overflow: "hidden",
        transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
        opacity: visibleFile ? 1 : 0, // Fade in/out effect
        transform: visibleFile ? "translateY(0)" : "translateY(10px)", // Slide down effect
      }}
    >
      <Typography
        sx={{ fontFamily: "'Montserrat', serif", fontSize: "1.1rem" }}
      >
        {truncateText(file?.filename || file.id, 22)}
      </Typography>

      {fields.map((field, index) => (
        <React.Fragment key={field.label}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 0.5,
              width: "100%",
            }}
          >
            {/* Label */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 23,
                }}
              >
                {field.icon}
              </Box>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "'Montserrat', serif",
                  fontWeight: 600,
                }}
              >
                {field.label}
              </Typography>
            </Box>
            {/* Value */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontFamily: "'Montserrat', serif",
              }}
            >
              {field.value}
            </Typography>
          </Box>
          {index < fields.length - 1 && <Divider sx={{ width: "100%" }} />}
        </React.Fragment>
      ))}
      <Button
        onClick={handleDelete}
        size="small"
        variant="contained"
        sx={{
          alignSelf: "flex-end",
          marginTop: 2,
          backgroundColor: "error.light",
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "error.dark",
          },
          textTransform: "none",
          fontFamily: "'Montserrat', serif",
          paddingY: 0.4,
        }}
        startIcon={<DeleteIcon />}
      >
        Delete
      </Button>
    </Box>
  );
};

export default FileDetails;
