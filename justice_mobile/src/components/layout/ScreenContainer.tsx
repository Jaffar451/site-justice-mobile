import React, { ReactNode } from "react";
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  Platform, 
  ViewStyle, 
  StyleProp, 
  SafeAreaView 
} from "react-native";
import { useAppTheme } from "../../theme/AppThemeProvider";

interface ScreenContainerProps {
  children: ReactNode;
  withPadding?: boolean;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  useSafeArea?: boolean;
}

const ScreenContainer = ({ 
  children, 
  withPadding = true, 
  style, 
  backgroundColor,
  useSafeArea = false 
}: ScreenContainerProps) => {
  const { theme, isDark } = useAppTheme();

  /**
   * ✅ STYLE WEB : 
   * Gestion du scroll et de la hauteur viewport
   * Correction TypeScript : Double cast pour accepter '100vh'
   */
  const webStyle = Platform.select({
    web: {
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    } as unknown as ViewStyle, 
    default: {}
  });

  const ContainerComponent = useSafeArea ? SafeAreaView : View;

  return (
    <View style={[
      styles.main, 
      { backgroundColor: backgroundColor || theme.colors.background },
      webStyle
    ]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        translucent 
        backgroundColor="transparent" 
      />
      
      <ContainerComponent style={[
        styles.container, 
        withPadding && styles.padding, 
        style
      ]}>
        {children}
      </ContainerComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1 },
  container: { flex: 1, width: '100%' },
  padding: { paddingHorizontal: 16 },
});

export default ScreenContainer;