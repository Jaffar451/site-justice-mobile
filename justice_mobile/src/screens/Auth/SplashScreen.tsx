import React, { useEffect, useRef } from "react";
import { 
  View, 
  Animated, 
  StyleSheet, 
  Image, 
  Dimensions, 
  StatusBar,
  Platform,
  ActivityIndicator
} from "react-native";
import { Text } from "react-native-paper";

// ✅ 1. Imports Architecture
import { useAuthStore } from "../../stores/useAuthStore";
import { getAppTheme } from "../../theme";
import { AuthScreenProps } from "../../types/navigation";

export default function SplashScreen({ navigation }: AuthScreenProps<'Splash'>) {
  // ✅ 2. Thème via Helper
  const theme = getAppTheme();
  const primaryColor = theme.color;
  
  // ✅ 3. Utilisation du Store
  const { user, isAuthenticated, hydrate } = useAuthStore();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // 1. Lancement de l'animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // 2. Hydratation et Redirection
    const initApp = async () => {
      // On laisse le temps à l'animation de se faire (2.5s)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // On tente de restaurer la session
      await hydrate();
      
      // La navigation est gérée automatiquement par AppNavigator
      // Si isAuthenticated passe à true, AppNavigator bascule sur le Stack sécurisé.
      // Si false, on reste sur AuthNavigator, donc on va vers Login.
      
      // Pour forcer la redirection explicite si besoin (optionnel mais plus sûr)
      if (!isAuthenticated) {
        navigation.replace("Login");
      }
    };

    initApp();
  }, [navigation, hydrate, isAuthenticated]);

  return (
    <View style={[styles.container, { backgroundColor: primaryColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      
      <Animated.View style={[
        styles.content, 
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}>
        <View style={styles.logoContainer}>
          {/* Assurez-vous que l'image existe bien à ce chemin, sinon mettez une icône temporaire */}
          <Image 
            source={require("../../../assets/armoirie.png")} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>e-Justice Niger</Text>
        <Text style={styles.subtitle}>Plateforme Judiciaire Intégrée</Text>
        <View style={styles.line} />
        <Text style={styles.motto}>FRATERNITÉ • TRAVAIL • PROGRÈS</Text>
      </Animated.View>

      <View style={styles.footer}>
        <ActivityIndicator animating={true} color="#FFF" size="small" />
        <Text style={styles.loadingText}>Vérification des habilitations...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 140,
    height: 140,
    backgroundColor: "#FFF",
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 15,
      },
      web: {
        boxShadow: '0px 10px 30px rgba(0,0,0,0.3)',
      }
    })
  },
  logo: {
    width: 90,
    height: 90,
  },
  title: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },
  line: {
    width: 40,
    height: 3,
    backgroundColor: "#EAB308", // Or du drapeau
    marginVertical: 20,
    borderRadius: 2,
  },
  motto: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  footer: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 15,
    fontWeight: "700",
  },
});