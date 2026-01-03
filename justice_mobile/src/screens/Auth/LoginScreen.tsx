import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/useAuthStore';
import ScreenContainer from '../../components/layout/ScreenContainer';
import { getAppTheme } from '../../theme';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, loading, error } = useAuthStore();
  const theme = getAppTheme(); // Récupère la couleur par défaut (Cyan pour citoyen avant login)

  const [email, setEmail] = useState(''); // ex: police@justice.ne
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    // L'action login du store va gérer l'API et la redirection via AppNavigator
    await login(email, password);
  };

  return (
    <ScreenContainer withPadding={false}>
      <View style={styles.header}>
        <Image 
          source={require('../../../assets/armoirie.png')} // Assure-toi d'avoir un logo ou retire cette ligne
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>JUSTICE MOBILE</Text>
        <Text style={styles.subtitle}>Portail Numérique Unifié du Niger</Text>
      </View>

      <View style={styles.form}>
        {/* Champ Email / Matricule */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#64748B" style={styles.icon} />
          <TextInput
            placeholder="Email ou Matricule"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Champ Mot de passe */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.icon} />
          <TextInput
            placeholder="Mot de passe"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Message d'erreur du store */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Bouton de Connexion */}
        <TouchableOpacity 
          style={[styles.loginBtn, { backgroundColor: theme.color }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.loginText}>SE CONNECTER</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as any)} style={styles.forgotBtn}>
          <Text style={styles.linkText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register' as any)}>
            <Text style={[styles.linkText, { color: theme.color }]}>Créer un compte Citoyen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  logo: { width: 100, height: 100, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: '900', color: '#1E293B', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 5 },
  form: { paddingHorizontal: 30 },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#F1F5F9', borderRadius: 12, 
    paddingHorizontal: 15, height: 55, marginBottom: 15,
    borderWidth: 1, borderColor: '#E2E8F0'
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#334155' },
  loginBtn: { 
    height: 55, borderRadius: 12, 
    justifyContent: 'center', alignItems: 'center', 
    marginTop: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 
  },
  loginText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  errorText: { color: '#EF4444', marginBottom: 10, textAlign: 'center', fontWeight: '600' },
  forgotBtn: { alignItems: 'center', marginTop: 20 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#64748B' },
  linkText: { fontWeight: '700', color: '#475569' }
});