import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  FormHelperText,
  LinearProgress,
  Divider,
  CssBaseline,
  Toolbar,
} from "@mui/material";
import textToImage from "../api/textToImage";
import OptionsBar from "../components/texttoimage/OptionsBar";
import { toast } from "react-toastify";

const TextToImage = () => {
  const [prompt, setPrompt] = useState("");
  const [modelUsed, setModelUsed] = useState("dall-e-2");
  const [n, setN] = useState(1);
  const [quality, setQuality] = useState("standard");
  const [size, setSize] = useState("512x512");
  const [style, setStyle] = useState("vivid");
  const [responseFormat, setResponseFormat] = useState("url");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadedImages, setLoadedImages] = useState(0);
  const [imageIds, setImageIds] = useState(Array(n).fill(null));
  const imagesContainerRef = useRef(null);

  // Generated images data
  const [payload, setPayload] = useState(null);

  // Options
  const modelOptions = [
    { value: "dall-e-2", label: "DALL-E 2" },
    { value: "dall-e-3", label: "DALL-E 3" },
  ];

  const qualityOptions = [
    { value: "standard", label: "Standard" },
    { value: "hd", label: "HD" },
  ];

  const responseFormatOptions = [
    { value: "url", label: "URL" },
    { value: "b64_json", label: "Base64 JSON" },
  ];

  const sizeOptionsDalle2 = ["256x256", "512x512", "1024x1024"];
  const sizeOptionsDalle3 = ["1024x1024", "1792x1024", "1024x1792"];

  const styleOptions = [
    { value: "vivid", label: "Vivid" },
    { value: "natural", label: "Natural" },
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();

    // Validate inputs based on constraints
    const newErrors = {};
    if (!prompt.trim()) {
      newErrors.prompt = "Prompt is required";
    } else {
      const maxLength = modelUsed === "dall-e-2" ? 1000 : 4000;
      if (prompt.length > maxLength) {
        newErrors.prompt = `Prompt must be less than ${maxLength} characters`;
      }
    }

    if (modelUsed === "dall-e-3" && n !== 1) {
      newErrors.n = "For DALL-E 3, n must be 1";
    }

    if (modelUsed === "dall-e-2" && (n < 1 || n > 10)) {
      newErrors.n = "For DALL-E 2, n must be between 1 and 10";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Prepare the payload
      const payload = {
        prompt,
        model_used: modelUsed,
        n,
        quality,
        size,
        style,
        response_format: responseFormat,
      };

      // Adjust payload based on the model
      if (modelUsed === "dall-e-2") {
        delete payload.quality; // Not supported
        delete payload.style; // Not supported
      } else if (modelUsed === "dall-e-3") {
        payload.n = 1; // Must be 1 for DALL-E 3
      }

      setPayload(payload);

      // Reset states among image generations
      setGeneratedImages([]);
      setImageIds(Array(n).fill(null));
      setLoadedImages(0);

      setLoading(true);

      try {
        const response = await textToImage.generateImages(payload);

        // Process the response
        let images = [];

        if (response.images && response.images.length > 0) {
          images = response.images.map((img) =>
            img.image_url
              ? img.image_url
              : `data:image/png;base64,${img.image_base64}`
          );
        } else {
          toast.error("Unexpected error occurred.");
        }

        setGeneratedImages(images);
        setImageIds(Array(images.length).fill(null));
      } catch (error) {
        console.error("Error generating image:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to generate image.";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (modelUsed === "dall-e-2") {
      setSize("512x512");
    } else if (modelUsed === "dall-e-3") {
      setSize("1024x1024");
      setN(1);
    }
  }, [modelUsed]);

  useEffect(() => {
    if (generatedImages.length > 0 && loadedImages === generatedImages.length) {
      imagesContainerRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loadedImages, generatedImages]);

  const handleImageLoad = () => {
    setLoadedImages((prevCount) => prevCount + 1);
  };

  return (
    <>
      <CssBaseline />
      <Toolbar />
      <Box
        sx={{
          p: 3,
          maxWidth: "800px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{
            fontWeight: "700",
            fontFamily: "'Montserrat', serif",
            letterSpacing: "0.05em",
          }}
        >
          Text to Image
        </Typography>
        <Typography
          variant="subtitle2"
          align="center"
          sx={{
            color: "gray",
            mt: 1,
            fontFamily: "Montserrat, sans-serif",
            mb: 4,
          }}
        >
          To enhance photorealism, use detailed descriptions including lighting,
          textures, and perspectives. Clear and specific prompts help DALL-E
          generate images that closely match your vision.
        </Typography>
        <Stack spacing={2}>
          {/* Prompt Input */}
          <TextField
            fullWidth
            label="Enter your prompt"
            variant="outlined"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            error={!!errors.prompt}
            helperText={errors.prompt}
            multiline
            rows={4}
            required
            sx={{
              "& .MuiInputBase-input": {
                fontFamily: "'Montserrat', serif",
                "&::placeholder": {
                  fontFamily: "'Montserrat', serif",
                },
              },
              "& .MuiInputLabel-root": {
                fontFamily: "'Montserrat', serif",
              },
              "& .MuiFormHelperText-root": {
                fontFamily: "'Montserrat', serif",
              },
            }}
          />

          {/* Model Selection */}
          <FormControl fullWidth variant="outlined">
            <InputLabel id="model-select-label">Model Used</InputLabel>
            <Select
              labelId="model-select-label"
              id="model-select"
              value={modelUsed}
              onChange={(e) => setModelUsed(e.target.value)}
              label="Model Used"
              sx={{
                "& .MuiInputBase-input": {
                  fontFamily: "'Montserrat', serif",
                  "&::placeholder": {
                    fontFamily: "'Montserrat', serif",
                  },
                },
                "& .MuiInputLabel-root": {
                  fontFamily: "'Montserrat', serif",
                },
                "& .MuiFormHelperText-root": {
                  fontFamily: "'Montserrat', serif",
                },
              }}
            >
              {modelOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  sx={{
                    fontFamily: "'Montserrat', serif",
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Number of Images (DALL-E 2) */}
          {modelUsed === "dall-e-2" && (
            <TextField
              label="Number of Images (n)"
              type="number"
              fullWidth
              variant="outlined"
              value={n}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (isNaN(value) || value < 1) {
                  setN(1); // Default to 1 if input is invalid
                } else if (value > 10) {
                  setN(10); // Cap the value at 10
                } else {
                  setN(value);
                }
              }}
              error={!!errors.n}
              helperText={errors.n}
              inputProps={{ min: 1, max: 10 }}
              required
              sx={{
                "& .MuiInputBase-input": {
                  fontFamily: "'Montserrat', serif",
                  "&::placeholder": {
                    fontFamily: "'Montserrat', serif",
                  },
                },
                "& .MuiInputLabel-root": {
                  fontFamily: "'Montserrat', serif",
                },
                "& .MuiFormHelperText-root": {
                  fontFamily: "'Montserrat', serif",
                },
              }}
            />
          )}

          {/* Quality and Style (DALL-E 3) */}
          {modelUsed === "dall-e-3" && (
            <>
              {/* Quality Selection */}
              <FormControl fullWidth variant="outlined">
                <InputLabel id="quality-select-label">Quality</InputLabel>
                <Select
                  labelId="quality-select-label"
                  id="quality-select"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  label="Quality"
                >
                  {qualityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Only supported for DALL-E 3</FormHelperText>
              </FormControl>

              {/* Style Selection */}
              <FormControl fullWidth variant="outlined">
                <InputLabel id="style-select-label">Style</InputLabel>
                <Select
                  labelId="style-select-label"
                  id="style-select"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  label="Style"
                  sx={{
                    "& .MuiInputBase-input": {
                      fontFamily: "'Montserrat', serif",
                      "&::placeholder": {
                        fontFamily: "'Montserrat', serif",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      fontFamily: "'Montserrat', serif",
                    },
                    "& .MuiFormHelperText-root": {
                      fontFamily: "'Montserrat', serif",
                    },
                  }}
                >
                  {styleOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      sx={{ fontFamily: "'Montserrat', serif" }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText sx={{ fontFamily: "'Montserrat', serif" }}>
                  Only supported for DALL-E 3
                </FormHelperText>
              </FormControl>
            </>
          )}

          {/* Image Size Selection */}
          <FormControl fullWidth variant="outlined">
            <InputLabel id="size-select-label">Image Size</InputLabel>
            <Select
              labelId="size-select-label"
              id="size-select"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              label="Image Size"
              sx={{
                "& .MuiInputBase-input": {
                  fontFamily: "'Montserrat', serif",
                  "&::placeholder": {
                    fontFamily: "'Montserrat', serif",
                  },
                },
                "& .MuiInputLabel-root": {
                  fontFamily: "'Montserrat', serif",
                },
                "& .MuiFormHelperText-root": {
                  fontFamily: "'Montserrat', serif",
                },
              }}
            >
              {(modelUsed === "dall-e-2"
                ? sizeOptionsDalle2
                : sizeOptionsDalle3
              ).map((option) => (
                <MenuItem
                  key={option}
                  value={option}
                  sx={{
                    fontFamily: "'Montserrat', serif",
                    "& *": {
                      fontFamily: "'Montserrat', serif",
                    },
                  }}
                >
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Response Format Selection */}
          <FormControl fullWidth variant="outlined">
            <InputLabel id="response-format-select-label">
              Response Format
            </InputLabel>
            <Select
              labelId="response-format-select-label"
              id="response-format-select"
              value={responseFormat}
              onChange={(e) => setResponseFormat(e.target.value)}
              label="Response Format"
              sx={{
                "& .MuiInputBase-input": {
                  fontFamily: "'Montserrat', serif",
                  "&::placeholder": {
                    fontFamily: "'Montserrat', serif",
                  },
                },
                "& .MuiInputLabel-root": {
                  fontFamily: "'Montserrat', serif",
                },
                "& .MuiFormHelperText-root": {
                  fontFamily: "'Montserrat', serif",
                },
              }}
            >
              {responseFormatOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  sx={{ fontFamily: "'Montserrat', serif" }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Generate Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerate}
            fullWidth
            disabled={loading}
          >
            <Typography sx={{ fontFamily: "'Montserrat', serif" }}>
              Generate Image
            </Typography>
          </Button>
          {loading && (
            <Box sx={{ width: "100%", marginTop: "5px" }}>
              <LinearProgress />
            </Box>
          )}
        </Stack>

        {/* Generated Images */}
        {generatedImages.length > 0 && (
          <Box sx={{ mt: 4 }} ref={imagesContainerRef}>
            <Divider
              sx={{
                mb: 4,
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                align="center"
                sx={{
                  fontWeight: "700",
                  letterSpacing: "0.05em",
                  fontFamily: "'Montserrat', serif",
                }}
              >
                Generated Image{generatedImages.length > 1 ? "s" : ""}
              </Typography>
            </Divider>
            <Stack spacing={2} alignItems="center">
              {generatedImages.map((src, index) => (
                <React.Fragment key={index}>
                  <OptionsBar
                    payload={payload}
                    src={src}
                    imageId={imageIds[index]}
                    setImageId={(id) => {
                      setImageIds((prev) => {
                        const newImageIds = [...prev];
                        newImageIds[index] = id;
                        return newImageIds;
                      });
                    }}
                  />
                  <img
                    src={src}
                    onLoad={handleImageLoad}
                    alt={`Generated ${index + 1}`}
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      marginTop: "10px",
                      paddingBottom: "20px",
                      borderBottom:
                        index < generatedImages.length - 1
                          ? "1px solid #D4D0CD"
                          : "none",
                    }}
                  />
                </React.Fragment>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </>
  );
};

export default TextToImage;
