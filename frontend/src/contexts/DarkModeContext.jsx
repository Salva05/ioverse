import { createContext, useContext, useEffect, useState } from "react";

const DarkModeContext = createContext();

export const useDarkMode = () => useContext(DarkModeContext);

export const DarkModeProvider = ({ children }) => {
  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const getInitialTheme = () => {
    const storedPreference = localStorage.getItem("theme-preference");
    if (storedPreference) return storedPreference;
    return "system";
  };

  const [themePreference, setThemePreference] = useState(getInitialTheme);
  const [darkMode, setDarkMode] = useState(
    themePreference === "system" ? getSystemTheme() : themePreference === "dark"
  );

  const toggleThemePreference = (preference) => {
    setThemePreference(preference);
    localStorage.setItem("theme-preference", preference);
  };

  useEffect(() => {
    const handleSystemThemeChange = (e) => {
      if (themePreference === "system") {
        setDarkMode(e.matches);
      }
    };

    if (themePreference === "system") {
      setDarkMode(getSystemTheme());
    } else if (themePreference === "dark") {
      setDarkMode(true);
    } else if (themePreference === "light") {
      setDarkMode(false);
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [themePreference]);

  return (
    <DarkModeContext.Provider
      value={{
        darkMode,
        themePreference,
        toggleThemePreference,
      }}
    >
      {children}
    </DarkModeContext.Provider>
  );
};
