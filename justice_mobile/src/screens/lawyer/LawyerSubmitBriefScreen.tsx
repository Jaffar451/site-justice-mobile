import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

import { useAppTheme } from "../../theme/AppThemeProvider";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";

export default function LawyerSubmitBriefScreen() {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { caseId } = route.params;

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = () => {
    if (!title.trim()) return Alert.alert("Erreur", "Veuillez donner un titre à vos conclusions.");
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Succès", "Vos conclusions ont été transmises au greffe et au magistrat.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    }, 2000);
  };

  return (
    <ScreenContainer>
      <AppHeader title="Dépôt de Conclusions" showBack />
      
      <View style={styles.container}>
        <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + "10" }]}>
           <Text style={{ color: theme.colors.primary, fontWeight: "800" }}>DOSSIER RG #{caseId}</Text>
        </View>

        <Text style={[styles.label, { color: theme.colors.text }]}>Titre des écritures</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: isDark ? "#1A1A1A" : "#F1F5F9", color: theme.colors.text }]}
          placeholder="Ex: Conclusions en défense..."
          value={title}
          onChangeText={setTitle}
        />

        <TouchableOpacity style={[styles.uploadZone, { borderColor: theme.colors.primary }]}>
          <Ionicons name="cloud-upload-outline" size={40} color={theme.colors.primary} />
          <Text style={[styles.uploadText, { color: theme.colors.text }]}>Sélectionner le fichier PDF</Text>
          <Text style={{ fontSize: 10, color: "#94A3B8" }}>Taille max : 10MB • Signé numériquement</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>DÉPOSER AU GREFFE</Text>}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  infoBox: { padding: 15, borderRadius: 12, marginBottom: 25 },
  label: { fontSize: 13, fontWeight: "800", marginBottom: 8 },
  input: { padding: 15, borderRadius: 12, marginBottom: 20 },
  uploadZone: { height: 180, borderWidth: 2, borderStyle: "dashed", borderRadius: 20, justifyContent: "center", alignItems: "center", gap: 10 },
  uploadText: { fontWeight: "700" },
  submitBtn: { height: 55, borderRadius: 15, justifyContent: "center", alignItems: "center", marginTop: 30 },
  btnText: { color: "#FFF", fontWeight: "900", letterSpacing: 1 }
});