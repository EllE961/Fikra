// src/theme/AppTheme.js
import { DefaultTheme, DarkTheme } from "@react-navigation/native";
import { lightColors, darkColors } from "./colors";

export const MyLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightColors.primary,
    background: lightColors.background,
    text: lightColors.text,
    card: lightColors.card,
    border: lightColors.border,
    notification: lightColors.primary,
  },
};

export const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkColors.primary,
    background: darkColors.background,
    text: darkColors.text,
    card: darkColors.card,
    border: darkColors.border,
    notification: darkColors.primary,
  },
};
