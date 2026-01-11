import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Image, ActivityIndicator, Alert, Keyboard, 
  KeyboardAvoidingView, Platform, ScrollView, Dimensions, StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/useAuthStore';
import ScreenContainer from '../../components/layout/ScreenContainer';
import { useAppTheme } from '../../theme/AppThemeProvider';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login, loading, error } = useAuthStore();
  const { theme, isDark } = useAppTheme();

  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!email || !password) {
      Alert.alert("Champs requis", "Veuillez saisir votre identifiant et votre mot de passe.");
      return;
    }

    try {
      await login(email, password);
    } catch (err: any) {
      console.error("Erreur LoginScreen:", err.message);
    }
  };

  // Couleur de bordure dynamique (sécurité si textSecondary n'existe pas)
  const borderColor = (theme.colors as any).textSecondary || '#E2E8F0';
  // Couleur de fond des inputs (plus sombre en dark mode)
  const inputBg = isDark ? '#1E293B' : '#F8FAFC';

  return (
    <ScreenContainer withPadding={false}>
      {/* Barre de statut adaptée à la couleur du header */}
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* 🟦 HEADER (Zone Colorée) */}
          <View style={[styles.headerContainer, { backgroundColor: theme.colors.primary }]}>
            <View style={styles.logoCircle}>
              <Image 
                source={require('../../../assets/armoirie.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appTitle}>JUSTICE MOBILE</Text>
            <Text style={styles.appSubtitle}>Niger • Portail Numérique Unifié</Text>
          </View>

          {/* ⬜ FORMULAIRE (Zone "Feuille" blanche/sombre) */}
          <View style={[
            styles.formContainer, 
            { 
              backgroundColor: theme.colors.background,
              // Ombre portée vers le haut pour détacher le formulaire
              shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 20 
            }
          ]}>
            
            <View style={styles.formContent}>
              <Text style={[styles.welcomeText, { color: theme.colors.text }]}>Connexion</Text>
              <Text style={[styles.instructionText, { color: borderColor }]}>
                Accédez à votre espace sécurisé
              </Text>

              {/* INPUT EMAIL */}
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor }]}>
                <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email ou Matricule"
                  placeholderTextColor="#94A3B8"
                  style={[styles.textInput, { color: theme.colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* INPUT PASSWORD */}
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  placeholder="Mot de passe"
                  placeholderTextColor="#94A3B8"
                  style={[styles.textInput, { color: theme.colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* LIEN MOT DE PASSE OUBLIÉ */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('ForgotPassword')} 
                style={styles.forgotBtn}
              >
                <Text style={[styles.forgotText, { color: theme.colors.text }]}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>

              {/* MESSAGES D'ERREUR */}
              {error && (
                <View style={[styles.errorContainer, { backgroundColor: theme.colors.danger + '15' }]}>
                  <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
                  <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
                </View>
              )}

              {/* BOUTON CONNEXION */}
              <TouchableOpacity 
                style={[
                  styles.loginBtn, 
                  { 
                    backgroundColor: theme.colors.primary,
                    shadowColor: theme.colors.primary 
                  }
                ]} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginBtnText}>SE CONNECTER</Text>
                )}
              </TouchableOpacity>

              {/* LIEN INSCRIPTION */}
              <View style={styles.footer}>
                <Text style={{ color: borderColor }}>Pas encore de compte ? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={[styles.registerLink, { color: theme.colors.primary }]}>
                    S'enrôler
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
  // HEADER
  headerContainer: {
    height: height * 0.40, // Prend 40% de l'écran
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40, // Laisse de la place pour que le formulaire chevauche
  },
  logoCircle: {
    width: 100, height: 100,
    backgroundColor: 'rgba(255,255,255,0.15)', // Cercle translucide
    borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
  },
  logo: { width: 60, height: 60 },
  appTitle: { 
    fontSize: 26, fontWeight: '900', color: '#FFF', 
    letterSpacing: 1.5, textTransform: 'uppercase' 
  },
  appSubtitle: { 
    fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.8)', 
    marginTop: 5, letterSpacing: 0.5 
  },

  // FORMULAIRE
  formContainer: {
    flex: 1,
    marginTop: -40, // Chevauchement élégant sur le header
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 35,
  },
  formContent: {
    paddingBottom: 30,
  },
  welcomeText: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  instructionText: { fontSize: 14, marginBottom: 25 },

  // INPUTS
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16,
    height: 58,
    marginBottom: 16,
    borderWidth: 1,
    paddingHorizontal: 15,
  },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, fontSize: 16, height: '100%' },
  eyeBtn: { padding: 8 },

  // LIENS & BOUTONS
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotText: { fontSize: 14, fontWeight: '600' },

  loginBtn: {
    height: 58,
    borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    // Ombre colorée
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 1 },

  // ERREUR
  errorContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 12, borderRadius: 12, marginBottom: 20, gap: 8
  },
  errorText: { fontSize: 13, fontWeight: '600', flexShrink: 1 },

  // FOOTER
  footer: { 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 10 
  },
  registerLink: { fontWeight: '800', fontSize: 15, textDecorationLine: 'underline' }
});