import React from "react";
import { ViewStyle, Platform } from "react-native";
// On renomme l'import par défaut pour créer notre propre wrapper "Toast"
import RNToast, { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";
import { useAppTheme } from "../../theme/AppThemeProvider";

/**
 * 🛠️ ADAPTATEUR (WRAPPER)
 * Cela permet d'utiliser Toast.show({ type, message }) partout dans l'app
 * sans casser le code existant, tout en utilisant la librairie en dessous.
 */
export const Toast = {
  show: ({ type, message, title }: { type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string }) => {
    // Titres par défaut selon le type
    let defaultTitle = "Information";
    if (type === "success") defaultTitle = "Succès";
    if (type === "error") defaultTitle = "Erreur";
    if (type === "warning") defaultTitle = "Attention";

    RNToast.show({
      type: type,
      text1: title || defaultTitle, // Titre (Gras)
      text2: message,             // Message (Normal)
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 50,              // Marge par rapport au haut (pour éviter l'encoche/StatusBar)
    });
  },
  hide: () => RNToast.hide()
};

/**
 * 🎨 COMPOSANT DE CONFIGURATION
 * À placer dans App.tsx
 */
export default function ToastManager() {
  const { theme, isDark } = useAppTheme();

  // Style de base pour tous les Toasts
  const baseStyle: ViewStyle = {
    backgroundColor: isDark ? "#2A2A2A" : "#FFFFFF",
    borderColor: isDark ? "#444" : "#F1F5F9",
    borderWidth: 1,
    borderLeftWidth: 8, // Bande latérale colorée
    borderRadius: 12,
    height: 75,
    width: "90%",
    alignSelf: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { 
        shadowColor: "#000", 
        shadowOpacity: 0.15, 
        shadowRadius: 8, 
        shadowOffset: { width: 0, height: 4 } 
      },
      android: { 
        elevation: 6 
      },
      web: {
        boxShadow: "0px 4px 12px rgba(0,0,0,0.1)"
      }
    })
  };

  const toastConfig: ToastConfig = {
    // ✅ SUCCÈS (Vert)
    success: (props) => (
      <BaseToast
        {...props}
        style={[baseStyle, { borderLeftColor: "#10B981" }]}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        text1Style={{
          fontSize: 15,
          fontWeight: "800",
          color: isDark ? "#FFF" : "#1F2937",
          marginBottom: 2
        }}
        text2Style={{
          fontSize: 13,
          fontWeight: "500",
          color: isDark ? "#9CA3AF" : "#6B7280",
        }}
      />
    ),

    // ❌ ERREUR (Rouge)
    error: (props) => (
      <ErrorToast
        {...props}
        style={[baseStyle, { borderLeftColor: theme.colors.danger }]}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        text1Style={{
          fontSize: 15,
          fontWeight: "800",
          color: theme.colors.danger,
          marginBottom: 2
        }}
        text2Style={{
          fontSize: 13,
          fontWeight: "500",
          color: isDark ? "#9CA3AF" : "#6B7280",
        }}
      />
    ),

    // ⚠️ WARNING (Orange)
    warning: (props) => (
      <BaseToast
        {...props}
        style={[baseStyle, { borderLeftColor: "#F59E0B" }]}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        text1Style={{
          fontSize: 15,
          fontWeight: "800",
          color: "#D97706",
          marginBottom: 2
        }}
        text2Style={{
          fontSize: 13,
          fontWeight: "500",
          color: isDark ? "#9CA3AF" : "#6B7280",
        }}
      />
    ),

    // ℹ️ INFO (Bleu)
    info: (props) => (
      <BaseToast
        {...props}
        style={[baseStyle, { borderLeftColor: theme.colors.primary }]}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        text1Style={{
          fontSize: 15,
          fontWeight: "800",
          color: theme.colors.primary,
          marginBottom: 2
        }}
        text2Style={{
          fontSize: 13,
          fontWeight: "500",
          color: isDark ? "#9CA3AF" : "#6B7280",
        }}
      />
    ),
  };

  return <RNToast config={toastConfig} />;
}