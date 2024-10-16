import React, { createContext } from 'react';

export const DrawerContext = createContext({
  open: false,
  isSmallScreen: false,
});
