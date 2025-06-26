import { useState } from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { SendOutlined, ScheduleSendOutlined } from "@mui/icons-material";
import ShareDialog from "./ShareDialog";
import UnshareDialog from "./UnshareDialog";
import Box from "@mui/material/Box";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import shareImage from "../../utils/shareImage";
import { toast } from "react-toastify";
import unshareImage from "../../utils/unshareImage";

// Handler for errors
const handleError = (msg, genericMsg, error) => {
  console.error(msg, error);
  const errorMessage = error.response?.data?.detail || genericMsg;
  toast.error(msg + errorMessage);
};

const Share = ({ image }) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [unshareDialogOpen, setUnshareDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // mutation for sharing an image
  const shareMutation = useMutation({
    mutationFn: async (hours) => await shareImage(image.id, hours),
    onSuccess: (data) => {
      // Update the specific imagte in the cache
      queryClient.setQueryData(["generatedImages"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          results: oldData.results.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  is_shared: true,
                  shared_at: data.shared_at,
                  expires_at: data.expires_at,
                }
              : img
          ),
        };
      });
      setShareDialogOpen(false);
      setUnshareDialogOpen(true);
      toast.success("Image shared!");
    },
    onError: (error) => {
      handleError(
        "Error sharing the image: ",
        "An error occurred while sharing the image.",
        error
      );
    },
  });

  // Mutation for unsharing the image
  const unshareMutation = useMutation({
    mutationFn: async () => await unshareImage(image.id),
    onSuccess: (data) => {
      // Update the cache
      // Update the specific imagte in the cache
      queryClient.setQueryData(["generatedImages"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          results: oldData.results.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  is_shared: false,
                  shared_at: null,
                  expires_at: null,
                }
              : img
          ),
        };
      });
      setUnshareDialogOpen(false);
      toast.success("Image unshared!");
    },
    onError: (error) => {
      handleError(
        "Error unsharing the image: ",
        "An error occurred while unsharing the image.",
        error
      );
    },
  });

  const handleClick = () => {
    image.is_shared ? setUnshareDialogOpen(true) : setShareDialogOpen(true);
  };

  return (
    <>
      <Tooltip
        placement="top"
        title={image.is_shared ? "Stop Sharing" : "Share"}
      >
        <Box display="inline-flex">
          <Button onClick={handleClick}>
            {image.is_shared ? (
              <ScheduleSendOutlined fontSize="small" color="action" />
            ) : (
              <SendOutlined fontSize="small" color="action" />
            )}
          </Button>
        </Box>
      </Tooltip>
      <ShareDialog
        open={shareDialogOpen}
        onShare={(duration) => shareMutation.mutate(duration)}
        setOpenState={setShareDialogOpen}
      />
      {image.is_shared && (
        <UnshareDialog
          open={unshareDialogOpen}
          image={image}
          setOpenState={setUnshareDialogOpen}
          onUnshare={() => unshareMutation.mutate()}
        />
      )}
    </>
  );
};

export default Share;
