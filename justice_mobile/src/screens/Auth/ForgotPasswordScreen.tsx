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
import { useAppTheme } from "../../theme/AppThemeProvider";

const { height } = Dimensions.get("window");

export default function ForgotPasswordScreen() {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    // 1. Validation de l'email
    if (!email.trim()) {
      const msg = "Veuillez entrer l'adresse email associée à votre compte.";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Email manquant", msg);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const msg = "Le format de l'adresse email est incorrect.";
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Email invalide", msg);
        return;
    }

    setLoading(true);
    try {
      // Simulation d'appel API (Remplacer par votre service d'oubli de mot de passe)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const title = "Email Envoyé 📧";
      const body = "Si cette adresse est enregistrée, vous recevrez un lien de réinitialisation. Pensez à vérifier vos spams.";

      if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${body}`);
        navigation.goBack();
      } else {
        Alert.alert(
          title, 
          body,
          [{ text: "Retour à la connexion", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      const msg = "Le service est temporairement indisponible. Veuillez réessayer plus tard.";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar 
        barStyle="light-content" 
        translucent 
        backgroundColor={theme.colors.primary} 
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
                style={[styles.backButton, { top: Platform.OS === 'web' ? 20 : 50 }]}
                activeOpacity={0.7}
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
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
            }
          ]}>
             <View style={styles.formContent}>
                
                <View style={styles.introBox}>
                   <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>Mot de passe oublié ?</Text>
                   {/* Fallback couleur safe pour textSecondary */}
                   <Text style={[styles.description, { color: (theme.colors as any).textSecondary || '#64748B' }]}>
                      Entrez votre adresse email ci-dessous. Nous vous enverrons les instructions pour définir un nouveau mot de passe sécurisé.
                   </Text>
                </View>

                <TextInput
                   label="Adresse Email"
                   value={email}
                   onChangeText={setEmail}
                   style={[styles.input, { backgroundColor: isDark ? "#2C2C2C" : "#F8FAFC" }]}
                   mode="outlined"
                   autoCapitalize="none"
                   keyboardType="email-address"
                   outlineColor="transparent"
                   activeOutlineColor={theme.colors.primary}
                   textColor={theme.colors.text}
                   left={<TextInput.Icon icon="email-outline" color={theme.colors.primary} />}
                   theme={{ roundness: 14 }}
                />

                <Button
                   mode="contained"
                   onPress={handleReset}
                   style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                   contentStyle={{ height: 54 }}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: height * 0.35, 
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
    backgroundColor: 'rgba(255,255,255,0.2)' 
  },
  brandContent: {
    alignItems: "center",
  },
  logoSurface: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    ...Platform.select({
      web: { boxShadow: '0px 8px 24px rgba(0,0,0,0.15)' },
      android: { elevation: 8 },
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8 }
    })
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
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
    marginTop: -40,
    paddingTop: 40,
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
    lineHeight: 22,
    fontSize: 14,
  },
  input: {
    marginBottom: 25,
  },
  submitButton: {
    borderRadius: 16,
    elevation: 4,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    alignItems: "center",
    paddingBottom: 20
  },
});