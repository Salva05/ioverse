import { Backdrop, Box, Button, CircularProgress, Typography, useTheme } from "@mui/material";
import React from "react";
import { FaRobot } from "react-icons/fa";
import { GoArrowUpRight } from "react-icons/go";
import { IoMdAdd } from "react-icons/io";
import { useAssistantContext } from "../../../../contexts/AssistantContext";
import { useCreateAssistant } from "../../../../hooks/assistant/useCreateAssistant";

const Create = () => {
  const theme = useTheme();
  const { setSelectedTab } = useAssistantContext();
  const { mutate, isPending } = useCreateAssistant();

  const handleCreate = () => {
    mutate(
      { model: "gpt-4o" },
      {
        onSuccess: (data) => {
          setSelectedTab("Settings");
        },
      }
    );
  };

  return (
    <>
      <Backdrop
        open={isPending}
        sx={{
          color: theme.palette.primary.main,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <CircularProgress size={80} thickness={5} />
      </Backdrop>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 360px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 50,
            height: 50,
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[800]
                : theme.palette.grey[300],
            borderRadius: "8px",
            pb: 0.3,
            mb: 1,
          }}
        >
          <FaRobot size={30} />
        </Box>
        <Typography
          sx={{
            fontFamily: "'Montserrat', serif",
            fontWeight: "bold",
            fontSize: "1.3rem",
            mb: 1,
          }}
        >
          Create an Assistant
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Montserrat', serif",
            fontSize: "1rem",
            textAlign: "center",
          }}
        >
          to get started with the{" "}
          <span
            onClick={() => setSelectedTab("Help")}
            style={{
              cursor: "pointer",
              color: theme.palette.primary.main,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Assistants API{" "}
            <GoArrowUpRight
              size={14}
              style={{ marginLeft: 4, verticalAlign: "middle" }}
            />
          </span>
        </Typography>
        <Button
          variant="contained"
          onClick={handleCreate}
          startIcon={<IoMdAdd size={20} />}
          sx={{
            mt: 2,
            fontFamily: "'Montserrat', serif",
            textTransform: "none",
            fontSize: "1rem",
            padding: "4px 12px",
            borderRadius: "8px",
            backgroundColor: theme.palette.success.light,
            "&:hover": {
              backgroundColor: theme.palette.success.dark,
            },
          }}
        >
          Create
        </Button>
      </Box>
    </>
  );
};

export default Create;
