import React, { useMemo, useState } from "react";
import { LuContainer } from "react-icons/lu";
import { TbExchange } from "react-icons/tb";
import { FaRobot } from "react-icons/fa";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import { useAssistantContext } from "../../../contexts/AssistantContext";
import { useMediaQuery } from "@mui/material";

const entities = [
  {
    icon: <FaRobot size="1.1em" style={{ marginLeft: 0.4, marginBottom: 2 }} />,
    label: "Assistant",
  },
  {
    icon: (
      <LuContainer size="1.1em" style={{ marginLeft: 0.4, marginBottom: 2 }} />
    ),
    label: "Thread",
  },
];

const SwitchEntityButton = () => {
  const isMobile = useMediaQuery("(max-width:815px)");

  const { selectedEntity, setSelectedEntity } = useAssistantContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Derived list with the selected entity as the first item
  const orderedEntities = useMemo(() => {
    if (!selectedEntity) return entities;
    return [
      entities.find((entity) => entity.label === selectedEntity),
      ...entities.filter((entity) => entity.label !== selectedEntity),
    ];
  }, [selectedEntity]);

  // Handle opening the menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClick}
          sx={{
            borderRadius: "50%",
            width: isMobile ? "30px" : "35px",
            height: isMobile ? "30px" : "35px",
            minWidth: 0,
            padding: 0,
          }}
        >
          <TbExchange size="1.33em" />
        </Button>
      </Box>
      {/* Selectable Assistant's Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        sx={{
          mt: 1,
          "& .MuiMenu-paper": {
            borderRadius: 2.5,
            minWidth: "190px",
            border: "1px solid",
            borderColor: (theme) => theme.palette.divider,
          },
        }}
      >
        {orderedEntities.flatMap((entity, index) => [
          <MenuItem
            key={entity.label}
            selected={selectedEntity === entity.label}
            onClick={() => {
              setSelectedEntity(entity.label);
              handleClose();
            }}
            sx={{
              mx: 1,
              borderRadius: 2,
              fontSize: "0.93rem",
              padding: "4px 8px",
              my: -0.2,
            }}
          >
            <ListItemIcon>{entity.icon}</ListItemIcon>
            {entity.label}
          </MenuItem>,
          index < orderedEntities.length - 1 && (
            <Divider key={`divider-${index}`} />
          ),
        ])}
      </Menu>
    </>
  );
};

export default SwitchEntityButton;
