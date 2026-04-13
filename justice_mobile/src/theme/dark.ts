import { spacing } from "./spacing";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { typography } from "./typography";
import { colors } from "./colors";

export const darkTheme = {
  dark: true,
  colors: {
    primary: "#4A7FC1",
    secondary: "#C9A84C",
    accent: "#64B5F6",
    success: "#34D399",
    warning: "#FBBF24",
    danger: "#F87171",
    background: "#0F172A",
    surface: "#1E293B",
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    black: "#000000",
    white: "#FFFFFF",
    transparent: "transparent",
    roles: colors.roles,
    status: colors.status,
    statusLabels: colors.statusLabels,
  },
  spacing,
  radius,
  shadows,
  typography,
};
