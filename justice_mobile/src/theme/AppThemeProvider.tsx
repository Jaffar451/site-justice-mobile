// PATH: src/theme/AppThemeProvider.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider as PaperProvider } from "react-native-paper"; // ✅ Ajout nécessaire pour l'UI
import { lightTheme } from "./light";
import { darkTheme } from "./dark";

// 🏆 TYPAGE
export type Theme = typeof lightTheme;

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark') => void; 
  setScheme: (mode: 'light' | 'dark') => void; // ✅ AJOUT : Pour compatibilité avec ProfileScreen
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
  setScheme: () => {}, // ✅ AJOUT
});

const THEME_STORAGE_KEY = "@user_theme_preference";

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  // 📥 CHARGEMENT : Récupère le thème sauvegardé au démarrage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDark(savedTheme === "dark");
        }
      } catch (e) {
        console.error("Erreur lors du chargement du thème", e);
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, []);

  // 🔄 ACTION : Bascule entre les thèmes et sauvegarde le choix
  const toggleTheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? "dark" : "light");
  };

  // 🎯 ACTION : Définit un thème spécifique
  const setTheme = async (mode: 'light' | 'dark') => {
    const isDarkMode = mode === 'dark';
    setIsDark(isDarkMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  // ✅ AJOUT : Alias pour que 'setScheme' appelle 'setTheme' (corrige l'erreur ProfileScreen)
  const setScheme = setTheme;

  const theme = isDark ? darkTheme : lightTheme;

  // On évite le flash blanc pendant le chargement du storage
  if (loading) return null;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme, setScheme }}>
      {/* ✅ Enveloppe PaperProvider pour appliquer le style aux composants */}
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);