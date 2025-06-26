import { useState, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import GeneratedImageCard from "./GeneratedImageCard";
import ImageDetailModal from "./ImageDetailModal";
import { toast } from "react-toastify";
import textToImage from "../../api/textToImage";
import FullscreenImageModal from "./FullScreenImageModal";

const fetchGeneratedImages = async () => {
  const response = await textToImage.getImages();
  return response;
};

const GeneratedImagesList = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["generatedImages"],
    queryFn: fetchGeneratedImages,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagesWithInfo, setImagesWithInfo] = useState([]);

  // State for Fullscreen Modal
  const [selectedFullscreenImage, setSelectedFullscreenImage] = useState(null);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  // Handle opening the detail modal
  const handleOpenModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  // Handle closing the detail modal
  const handleCloseModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  // Handle opening the fullscreen modal
  const handleOpenFullscreen = (image) => {
    setSelectedFullscreenImage(image);
    setIsFullscreenOpen(true);
  };

  // Handle closing the fullscreen modal
  const handleCloseFullscreen = () => {
    setSelectedFullscreenImage(null);
    setIsFullscreenOpen(false);
  };

  useEffect(() => {
    if (isError) {
      toast.error(
        "Error loading images: " + (error?.message || "Unknown error")
      );
    }
  }, [isError, error]);

  useEffect(() => {
    if (data && data.results) {
      setImagesWithInfo(data.results);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography color="error" variant="h6" align="center" sx={{ mt: 4 }}>
        Failed to load images.
      </Typography>
    );
  }

  if (imagesWithInfo.length === 0) {
    return (
      <Typography
        variant="h6"
        align="center"
        sx={{ mt: 4, fontFamily: "'Montserrat', serif" }}
      >
        No images generated yet.
      </Typography>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(256px, 256px))",
          gap: 2,
          justifyContent: "center",
          paddingBottom: "50px",
          "& *": {
            fontFamily: "'Montserrat', serif",
          },
        }}
      >
        {imagesWithInfo.map((image) => (
          <GeneratedImageCard
            key={image.id}
            image={image}
            onViewDetails={() => handleOpenModal(image)}
            onViewFullscreen={() => handleOpenFullscreen(image)}
          />
        ))}
      </Box>

      {/* Image Detail Modal */}
      {selectedImage && (
        <ImageDetailModal
          open={isModalOpen}
          handleClose={handleCloseModal}
          image={selectedImage}
        />
      )}
      {/* Fullscreen Image Modal */}
      {selectedFullscreenImage && (
        <FullscreenImageModal
          open={isFullscreenOpen}
          handleClose={handleCloseFullscreen}
          image={selectedFullscreenImage}
        />
      )}
    </>
  );
};

export default GeneratedImagesList;
