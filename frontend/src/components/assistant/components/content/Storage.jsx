import { Box, useTheme } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { DrawerContext } from "../../../../contexts/DrawerContext";
import LeftColumn from "./storage_sections/LeftColumn";
import RightColumn from "./storage_sections/RightColumn";

const Storage = () => {
  const { isSmallScreen } = useContext(DrawerContext);
  const theme = useTheme();

  // Only one entity handling - no differentiation between files and vector stores
  const [selected, setSelected] = useState("Files");
  const [file, setFile] = useState(null);
  const [lockedFile, setLockedFile] = useState(null);

  const handleClick = (entity) => {
    setSelected(entity);
  };

  const handleOutsideClick = (event) => {
    // Check if the clicked element is either a file or a store item
    if (
      !event.target.closest(".file-item") &&
      !event.target.closest(".store-item")
    ) {
      setLockedFile(null); // Deselect the locked file or store when clicking outside
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    console.log("Locked ", lockedFile);
  }, [lockedFile])
  return (
    <Box
      sx={{
        display: isSmallScreen ? "block" : "flex",
        width: "100%",
        height: "100%",
        flexGrow: 1,
      }}
    >
      {isSmallScreen ? (
        <>
          {/* Mobile Screens */}
          {/* Header */}
          <Box
            sx={{
              position: "sticky",
              top: `calc(${theme.mixins.toolbar.minHeight}px + 56px)`,
              zIndex: theme.zIndex.appBar - 2,
              width: "100%",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.palette.background.default,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <LeftColumn
              handleClick={handleClick}
              selected={selected}
              file={file}
              lockedFile={lockedFile}
            />
          </Box>

          {/* Main Content */}
          <Box
            sx={{
              marginTop: "20px",
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <RightColumn
              selected={selected}
              file={lockedFile || file}
              setFile={setFile}
              lockedFile={lockedFile}
              setLockedFile={setLockedFile}
            />
          </Box>
        </>
      ) : (
        <>
          {/* Wide Screens */}
          {/* Left Column: Fixed width */}
          <Box
            sx={{
              width: "300px",
              display: "flex",
              justifyContent: "center",
              borderRight: `1px solid ${theme.palette.divider}`,
              flexShrink: 0,
            }}
          >
            <LeftColumn
              handleClick={handleClick}
              selected={selected}
              file={file}
              lockedFile={lockedFile}
            />
          </Box>

          {/* Right Column: Flexible width */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 2,
              padding: 2,
              overflowY: "auto",
              width: "100%",
            }}
          >
            <RightColumn
              selected={selected}
              file={lockedFile || file}
              setFile={setFile}
              lockedFile={lockedFile}
              setLockedFile={setLockedFile}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default Storage;
