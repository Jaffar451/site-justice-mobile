import React, { ReactNode } from "react";
import { View, StyleSheet, StatusBar, Platform, ViewStyle, StyleProp } from "react-native";
import { useAppTheme } from "../../theme/AppThemeProvider";

interface ScreenContainerProps {
  children: ReactNode;
  withPadding?: boolean;
  style?: StyleProp<ViewStyle>;
}

const ScreenContainer = ({ children, withPadding = true, style }: ScreenContainerProps) => {
  const { theme, isDark } = useAppTheme();

  /**
   * ✅ STYLE WEB : 
   * On utilise 'fixed' pour le container principal sur Web pour éviter le double scroll
   * et on ajuste le padding-top pour le Header (60px à 80px selon votre Header).
   */
  const webStyle = Platform.select({
    web: {
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      // On retire le paddingTop ici s'il est déjà géré par le composant interne ou le ScrollView
      paddingTop: 60, 
    } as any,
    default: {}
  });

  return (
    <View style={[
      styles.main, 
      { backgroundColor: theme.colors.background },
      webStyle
    ]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        translucent 
        backgroundColor="transparent" 
      />
      
      <View style={[
        styles.container, 
        withPadding && styles.padding, 
        // ✅ Sur Mobile, on évite que le contenu colle trop au Header
        Platform.OS !== 'web' && { marginTop: 5 }, 
        style
      ]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: { 
    flex: 1,
    // ✅ Sur Android, on utilise la hauteur de la barre d'état pour éviter le chevauchement
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  container: { 
    flex: 1,
    width: '100%',
  },
  padding: { 
    paddingHorizontal: 16 
  },
});

export default ScreenContainer;