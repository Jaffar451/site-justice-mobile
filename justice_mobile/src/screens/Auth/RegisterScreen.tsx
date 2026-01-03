import React, { useState } from "react";
import { 
  View, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
  StatusBar
} from "react-native";
import { Button, Text, TextInput, Title, Surface } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";

// Types & Navigation
import { AuthScreenProps } from "../../types/navigation";

// Services
import { register } from "../../services/auth.service";

// Composants (J'ai retiré SmartFooter des imports inutiles)
import ScreenContainer from "../../components/layout/ScreenContainer";
import { useAppTheme } from "../../theme/AppThemeProvider";

const { height } = Dimensions.get("window");

export default function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const { theme, isDark } = useAppTheme();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    telephone: "", 
    password: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (key: keyof typeof form, value: string) => 
    setForm({ ...form, [key]: value });

  // ✅ LOGIQUE CORRIGÉE POUR LA REDIRECTION
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (userData: any) => register(userData),
    onSuccess: () => {
      // Sur le WEB, on utilise window.alert et on navigue directement
      if (Platform.OS === 'web') {
        window.alert("Inscription Réussie ✅\n\nVotre compte a été créé. Vous allez être redirigé vers la connexion.");
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
      } else {
        // Sur MOBILE, on utilise l'Alert native jolie
        Alert.alert(
          "Inscription Réussie ✅", 
          "Votre compte a été créé avec succès. Veuillez vous connecter.",
          [
            { 
              text: "SE CONNECTER", 
              onPress: () => {
                // Reset empêche le retour arrière vers l'inscription
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
              } 
            }
          ]
        );
      }
    },
    onError: (err: any) => {
      const serverMessage = err?.response?.data?.message || "";
      console.error("Erreur inscription:", serverMessage);
      
      const message = (serverMessage.includes('email') || serverMessage.includes('telephone'))
        ? "Cet email ou ce numéro est déjà utilisé."
        : "Impossible de créer le compte. Vérifiez votre connexion.";

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert("Erreur", message);
      }
    }
  });

  const handleRegister = async () => {
    if (!form.firstname.trim() || !form.lastname.trim() || !form.email.trim() || !form.telephone.trim() || !form.password) {
        // Gestion web/mobile simple
        const msg = "Veuillez remplir tous les champs obligatoires.";
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Champs requis", msg);
        return;
    }

    if (form.password.length < 6) {
        const msg = "Le mot de passe doit contenir au moins 6 caractères.";
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Mot de passe trop court", msg);
        return;
    }

    await mutateAsync({
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim(),
        password: form.password
    });
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
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
          
          {/* HEADER */}
          <View style={[styles.headerContainer, { backgroundColor: theme.colors.primary }]}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              <View style={styles.brandContent}>
                <Surface style={[styles.logoSurface, { elevation: 8 }]}>
                   <Image 
                     source={require("../../../assets/armoirie.png")} 
                     style={styles.logoImage}
                     resizeMode="contain"
                   />
                </Surface>
                <Title style={styles.headerTitle}>Inscription</Title>
                <Text style={styles.headerSubtitle}>ESPACE CITOYEN SÉCURISÉ</Text>
              </View>
          </View>

          {/* FORMULAIRE */}
          <View style={[
            styles.formContainer, 
            { 
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
            }
          ]}>
             <View style={styles.formContent}>
                
                <View style={styles.inputRow}>
                   <TextInput
                      label="Prénom"
                      value={form.firstname}
                      onChangeText={(v) => onChange("firstname", v)}
                      style={[styles.inputHalf, { backgroundColor: isDark ? "#2C2C2C" : "#F5F6F8" }]}
                      mode="outlined"
                      outlineColor="transparent"
                      activeOutlineColor={theme.colors.primary}
                      textColor={theme.colors.text}
                      theme={{ roundness: 14 }}
                   />
                   <View style={{ width: 12 }} />
                   <TextInput
                      label="Nom"
                      value={form.lastname}
                      onChangeText={(v) => onChange("lastname", v)}
                      style={[styles.inputHalf, { backgroundColor: isDark ? "#2C2C2C" : "#F5F6F8" }]}
                      mode="outlined"
                      outlineColor="transparent"
                      activeOutlineColor={theme.colors.primary}
                      textColor={theme.colors.text}
                      theme={{ roundness: 14 }}
                   />
                </View>

                <TextInput
                   label="Email"
                   value={form.email}
                   onChangeText={(v) => onChange("email", v)}
                   style={[styles.input, { backgroundColor: isDark ? "#2C2C2C" : "#F5F6F8" }]}
                   mode="outlined"
                   autoCapitalize="none"
                   keyboardType="email-address"
                   outlineColor="transparent"
                   activeOutlineColor={theme.colors.primary}
                   textColor={theme.colors.text}
                   left={<TextInput.Icon icon="email-outline" color={theme.colors.primary} />}
                   theme={{ roundness: 14 }}
                />

                <TextInput
                   label="Numéro de téléphone"
                   value={form.telephone}
                   onChangeText={(v) => onChange("telephone", v)}
                   style={[styles.input, { backgroundColor: isDark ? "#2C2C2C" : "#F5F6F8" }]}
                   mode="outlined"
                   keyboardType="phone-pad"
                   placeholder="Ex: 90000000"
                   outlineColor="transparent"
                   activeOutlineColor={theme.colors.primary}
                   textColor={theme.colors.text}
                   left={<TextInput.Icon icon="phone-outline" color={theme.colors.primary} />}
                   theme={{ roundness: 14 }}
                />

                <TextInput
                   label="Mot de passe"
                   value={form.password}
                   onChangeText={(v) => onChange("password", v)}
                   style={[styles.input, { backgroundColor: isDark ? "#2C2C2C" : "#F5F6F8" }]}
                   mode="outlined"
                   secureTextEntry={!showPassword}
                   outlineColor="transparent"
                   activeOutlineColor={theme.colors.primary}
                   textColor={theme.colors.text}
                   left={<TextInput.Icon icon="lock-outline" color={theme.colors.primary} />}
                   right={
                     <TextInput.Icon 
                          icon={showPassword ? "eye-off" : "eye"} 
                          onPress={() => setShowPassword(!showPassword)} 
                     />
                   }
                   theme={{ roundness: 14 }}
                />

                <Button
                   mode="contained"
                   onPress={handleRegister}
                   style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                   contentStyle={{ height: 54 }}
                   labelStyle={{ fontSize: 16, fontWeight: "bold" }}
                   loading={isPending}
                   disabled={isPending}
                >
                   {isPending ? "Création en cours..." : "S'INSCRIRE MAINTENANT"}
                </Button>

                <View style={styles.footerLinks}>
                   <Text style={{ color: theme.colors.textSecondary }}>Déjà inscrit ? </Text>
                   <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                      <Text style={{ color: theme.colors.primary, fontWeight: "bold" }}>Se connecter</Text>
                   </TouchableOpacity>
                </View>

                {/* ✅ FOOTER RETIRÉ ICI */}
                <View style={{ height: 40 }} /> 
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
    paddingTop: 20
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 50,
    left: 20,
    zIndex: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)'
  },
  brandContent: {
    alignItems: "center",
    marginTop: -20,
  },
  logoSurface: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0px 8px 24px rgba(0,0,0,0.15)' }
    })
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "white",
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 2,
    marginTop: 5,
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
  inputRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  inputHalf: {
    flex: 1,
  },
  input: {
    marginBottom: 14,
  },
  submitButton: {
    marginTop: 15,
    borderRadius: 16,
    elevation: 4,
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(26, 35, 126, 0.25)' }
    })
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    alignItems: "center",
  },
});