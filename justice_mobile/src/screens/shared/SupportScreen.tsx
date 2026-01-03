import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Linking, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../theme/AppThemeProvider";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";

export default function SupportScreen() {
  const { theme, isDark } = useAppTheme();
  
  // ✅ CORRECTION ICI : theme.colors.primary
  const primaryColor = theme.colors.primary;

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 📞 Actions rapides
  const handleCall = () => Linking.openURL("tel:17");
  const handleEmail = () => Linking.openURL("mailto:support@justice.gouv.ne");

  // 📤 Envoi du formulaire (Simulation pour l'instant)
  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Champs requis", "Merci de remplir l'objet et le message.");
      return;
    }

    setLoading(true);
    // Simulation d'un appel API
    setTimeout(() => {
      setLoading(false);
      if (Platform.OS === 'web') {
          window.alert("Message envoyé. Votre demande a été transmise.");
      } else {
          Alert.alert("Message envoyé", "Votre demande a été transmise au support technique. Nous vous répondrons sous 24h.");
      }
      setSubject("");
      setMessage("");
    }, 1500);
  };

  return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Support Technique" showBack />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* ℹ️ Intro */}
          <Text style={[styles.intro, { color: isDark ? "#CBD5E1" : "#64748B" }]}>
            Une difficulté technique ? Une question sur votre dossier ? Notre équipe est disponible pour vous aider.
          </Text>

          {/* 📞 Cartes de Contact */}
          <View style={styles.contactRow}>
            <TouchableOpacity onPress={handleCall} style={[styles.contactCard, { backgroundColor: "#DEF7EC" }]}>
              <Ionicons name="call" size={24} color="#046C4E" />
              <Text style={[styles.contactLabel, { color: "#03543F" }]}>Urgence (17)</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleEmail} style={[styles.contactCard, { backgroundColor: "#E1EFFE" }]}>
              <Ionicons name="mail" size={24} color="#1A56DB" />
              <Text style={[styles.contactLabel, { color: "#1E429F" }]}>Email</Text>
            </TouchableOpacity>
          </View>

          {/* 📝 Formulaire */}
          <View style={[styles.formCard, { backgroundColor: isDark ? "#1E293B" : "#FFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
            <Text style={[styles.formTitle, { color: isDark ? "#FFF" : "#1E293B" }]}>Envoyer un message</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>OBJET DE LA DEMANDE</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                placeholder="Ex: Bug sur l'écran d'accueil"
                placeholderTextColor="#94A3B8"
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>VOTRE MESSAGE</Text>
              <TextInput 
                style={[styles.textArea, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                placeholder="Décrivez votre problème en détail..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />
            </View>

            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.sendBtn, { backgroundColor: primaryColor }]}
              onPress={handleSend}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.sendBtnText}>ENVOYER LA DEMANDE</Text>
                  <Ionicons name="send" size={16} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* 🏢 Info Pied de page */}
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>Ministère de la Justice - DSI</Text>
            <Text style={styles.footerSubText}>Boulevard de la République, Niamey</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  intro: { fontSize: 13, textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  
  contactRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  contactCard: { flex: 1, height: 90, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  contactLabel: { fontWeight: '700', fontSize: 13 },
  
  formCard: { padding: 20, borderRadius: 20, borderWidth: 1 },
  formTitle: { fontSize: 16, fontWeight: '800', marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 11, fontWeight: '700', color: "#64748B", marginBottom: 8, letterSpacing: 0.5 },
  input: { height: 50, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, fontSize: 14 },
  textArea: { minHeight: 120, borderRadius: 12, padding: 15, borderWidth: 1, fontSize: 14 },
  
  sendBtn: { height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
  sendBtnText: { color: "#FFF", fontWeight: '800', fontSize: 13, letterSpacing: 1 },

  footerInfo: { marginTop: 40, alignItems: 'center' },
  footerText: { fontSize: 12, fontWeight: '700', color: "#94A3B8" },
  footerSubText: { fontSize: 11, color: "#CBD5E1", marginTop: 4 }
});