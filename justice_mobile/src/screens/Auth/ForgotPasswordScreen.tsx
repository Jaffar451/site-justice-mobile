import React, { useState } from "react";
import { 
  View, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar
} from "react-native";
import { Button, Text, TextInput, Title, Surface } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Composants & Thème
import ScreenContainer from "../../components/layout/ScreenContainer";
import SmartFooter from "../../components/layout/SmartFooter";
import { useAppTheme } from "../../theme/AppThemeProvider";

const { height } = Dimensions.get("window");

export default function ForgotPasswordScreen() {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    // 1. Validation de l'email
    if (!email.trim()) {
      Alert.alert("Email manquant", "Veuillez entrer l'adresse email associée à votre compte.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Alert.alert("Email invalide", "Le format de l'adresse email est incorrect.");
        return;
    }

    setLoading(true);
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        "Email Envoyé", 
        "Si cette adresse est enregistrée, vous recevrez un lien de réinitialisation dans quelques instants. Pensez à vérifier vos spams.",
        [{ text: "Retour à la connexion", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Erreur", "Le service est temporairement indisponible. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar 
        barStyle="light-content" 
        translucent 
        backgroundColor="transparent" 
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          
          {/* SECTION HAUTE : Header Immersif */}
          <View style={[styles.headerContainer, { backgroundColor: theme.colors.primary }]}>
             
             {/* Bouton Retour */}
             <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={[styles.backButton, { top: Platform.OS === 'ios' ? 50 : 40 }]}
                activeOpacity={0.7}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
             >
                <Ionicons name="arrow-back" size={26} color="white" />
             </TouchableOpacity>

             <View style={styles.brandContent}>
                <Surface style={[styles.logoSurface, { elevation: 8 }]}>
                   <Ionicons name="lock-open-outline" size={40} color={theme.colors.primary} />
                </Surface>
                <Title style={styles.headerTitle}>RÉCUPÉRATION</Title>
                <Text style={styles.headerSubtitle}>SÉCURITÉ DU COMPTE</Text>
             </View>
          </View>

          {/* SECTION BASSE : Formulaire */}
          <View style={[
            styles.formContainer, 
            { 
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
            }
          ]}>
             <View style={styles.formContent}>
                
                <View style={styles.introBox}>
                   <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>Mot de passe oublié ?</Text>
                   <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                      Entrez votre adresse email ci-dessous. Nous vous enverrons les instructions pour définir un nouveau mot de passe sécurisé.
                   </Text>
                </View>

                <TextInput
                   label="Adresse Email"
                   value={email}
                   onChangeText={setEmail}
                   style={[styles.input, { backgroundColor: isDark ? "#2C2C2C" : "#F5F6F8" }]}
                   mode="outlined"
                   autoCapitalize="none"
                   keyboardType="email-address"
                   outlineColor="transparent"
                   activeOutlineColor={theme.colors.primary}
                   textColor={theme.colors.text}
                   left={<TextInput.Icon icon="email-outline" color={theme.colors.primary} />}
                   theme={{ roundness: 12 }}
                />

                <Button
                   mode="contained"
                   onPress={handleReset}
                   style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                   contentStyle={{ height: 55 }}
                   labelStyle={{ fontSize: 16, fontWeight: "bold", letterSpacing: 0.5 }}
                   loading={loading}
                   disabled={loading}
                >
                   {loading ? "Envoi en cours..." : "RÉINITIALISER"}
                </Button>

                <View style={styles.footerLinks}>
                   <TouchableOpacity onPress={() => navigation.goBack()}>
                      <Text style={{ color: theme.colors.primary, fontWeight: "700", fontSize: 15 }}>
                         Annuler et se connecter
                      </Text>
                   </TouchableOpacity>
                </View>
             </View>

             <View style={{ marginTop: 20, paddingBottom: 20 }}>
                <SmartFooter />
             </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: height * 0.35, // 35% de l'écran pour l'équilibre visuel
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
    paddingTop: 10
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)' // Fond semi-transparent pour visibilité
  },
  brandContent: {
    alignItems: "center",
    marginTop: 0,
  },
  logoSurface: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 2,
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
    marginTop: -30, // Chevauchement élégant
    paddingTop: 35,
    paddingHorizontal: 25,
  },
  formContent: {
    flex: 1,
  },
  introBox: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    lineHeight: 20,
    fontSize: 14,
  },
  input: {
    marginBottom: 25,
  },
  submitButton: {
    borderRadius: 14,
    elevation: 4,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    alignItems: "center",
  },
});