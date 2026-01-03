import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Imports Architecture Alignés
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { JudgeScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { updateComplaint, updateComplaintStatus } from "../../services/complaint.service";

// Configuration des établissements pénitentiaires (Niger)
const PRISONS = [
  { id: "niamey_civil", name: "Maison d'Arrêt de Niamey (Civile)" },
  { id: "koutoukale", name: "Prison de Haute Sécurité (Koutoukalé)" },
  { id: "say", name: "Maison d'Arrêt de Say" },
  { id: "kollo", name: "Maison d'Arrêt de Kollo" },
  { id: "tillaberi", name: "Maison d'Arrêt de Tillabéri" },
  { id: "ouallam", name: "Maison d'Arrêt de Ouallam" },
];

export default function JudgePreventiveDetentionScreen({ route, navigation }: JudgeScreenProps<'JudgeCaseDetail'>) {
  // ✅ 2. Thème Dynamique & Auth
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  
  const params = route.params as any;
  const { caseId, personName = "Le Prévenu" } = params || { caseId: 0 };

  const [selectedPrison, setSelectedPrison] = useState<typeof PRISONS[0] | null>(null);
  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    alertBg: isDark ? "#450A0A" : "#FEF2F2",
    alertText: isDark ? "#FCA5A5" : "#EF4444",
  };

  const handleIssueDetention = async () => {
    if (!selectedPrison || !reason.trim() || !duration) {
      const msg = "Veuillez désigner l'établissement et motiver le placement en détention.";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Motivation requise", msg);
      return;
    }

    const title = "SIGNATURE DU MANDAT";
    const msg = `Vous ordonnez l'incarcération de ${personName} à la ${selectedPrison.name}. Confirmer ?`;

    if (Platform.OS === 'web') {
        const confirm = window.confirm(`${title} : ${msg}`);
        if (confirm) executeDetention();
    } else {
        Alert.alert(title, msg, [
          { text: "Réviser", style: "cancel" },
          { text: "Signer numériquement", style: "destructive", onPress: executeDetention },
        ]);
    }
  };

  const executeDetention = async () => {
    setLoading(true);
    try {
      await updateComplaint(caseId, {
        detentionDetails: {
          prisonId: selectedPrison?.id,
          prisonName: selectedPrison?.name,
          durationEstimated: duration,
          reason: reason.trim(),
          issuedAt: new Date().toISOString(),
          judgeSignature: `JUDGE-${user?.id}-${Date.now()}`
        }
      } as any);

      await updateComplaintStatus(caseId, "instruction");

      if (Platform.OS === 'web') window.alert("✅ Mandat de dépôt signé.");
      navigation.navigate("JudgeHome");
    } catch (error) {
      Alert.alert("Erreur Système", "Échec de la signature numérique.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Mandat de Dépôt" showBack={true} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.bgMain }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* 🚨 CARTE DU PRÉVENU */}
          <View style={[styles.suspectCard, { backgroundColor: colors.alertBg, borderColor: colors.alertText }]}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" }]}>
              <Ionicons name="lock-closed" size={24} color={colors.alertText} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.labelSmall, { color: colors.alertText }]}>PRÉVENU À ÉCROUER</Text>
              <Text style={[styles.suspectName, { color: colors.textMain }]}>{personName.toUpperCase()}</Text>
              <Text style={[styles.caseIdText, { color: colors.textSub }]}>Dossier RG #{caseId}</Text>
            </View>
          </View>

          {/* SÉLECTEUR PRISON */}
          <Text style={[styles.label, { color: colors.textSub }]}>Établissement Pénitentiaire *</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.selector, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            onPress={() => setModalVisible(true)}
          >
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
              <Ionicons name="business" size={20} color={selectedPrison ? primaryColor : colors.textSub} />
              <Text style={{ color: selectedPrison ? colors.textMain : colors.textSub, fontSize: 15, fontWeight: '700' }}>
                {selectedPrison ? selectedPrison.name : "Choisir une Maison d'Arrêt..."}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.textSub} />
          </TouchableOpacity>

          {/* DURÉE ESTIMÉE */}
          <Text style={[styles.label, { color: colors.textSub }]}>Durée initiale prévue (Mois)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
            placeholder="Ex: 4"
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />

          {/* MOTIFS DE LA DÉTENTION */}
          <Text style={[styles.label, { color: colors.textSub }]}>Motivation Juridique *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
            placeholder="Justifier le placement : Risque de fuite, conservation des preuves..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            multiline
            numberOfLines={5}
            value={reason}
            onChangeText={setReason}
            textAlignVertical="top"
          />

          {/* AVERTISSEMENT LÉGAL */}
          <View style={[styles.legalWarning, { backgroundColor: isDark ? "#431407" : "#FFF7ED", borderColor: isDark ? "#9A3412" : "#F59E0B" }]}>
            <Ionicons name="alert-circle" size={22} color={isDark ? "#FB923C" : "#EA580C"} />
            <Text style={[styles.legalText, { color: isDark ? "#FB923C" : "#9A3412" }]}>
              Attention : Ce mandat est un titre exécutoire. Une fois signé, l'ordre d'écrou est définitif.
            </Text>
          </View>

          {/* BOUTON DE SIGNATURE */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.detainBtn, { backgroundColor: "#EF4444" }, loading && { opacity: 0.7 }]}
            onPress={handleIssueDetention}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={22} color="#FFF" />
                <Text style={styles.detainBtnText}>APPOSER LA SIGNATURE DU JUGE</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 140 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Sélection Prison */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textMain }]}>REGISTRE DES ÉTABLISSEMENTS</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textSub} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={PRISONS}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setSelectedPrison(item);
                    setModalVisible(false);
                  }}
                >
                  <Ionicons name="business-outline" size={20} color={primaryColor} style={{ marginRight: 15 }} />
                  <Text style={[styles.modalItemText, { color: colors.textMain }]}>{item.name}</Text>
                  {selectedPrison?.id === item.id && <Ionicons name="checkmark-circle" size={20} color="#10B981" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  suspectCard: { flexDirection: "row", alignItems: "center", padding: 20, borderRadius: 24, borderWidth: 2, marginBottom: 30 },
  iconCircle: { width: 54, height: 54, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 18 },
  labelSmall: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginBottom: 5 },
  suspectName: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  caseIdText: { fontSize: 14, marginTop: 2, fontWeight: '700' },
  
  label: { fontSize: 11, fontWeight: "900", marginBottom: 12, marginTop: 15, textTransform: 'uppercase', letterSpacing: 1 },
  selector: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, borderRadius: 16, borderWidth: 1.5 },
  input: { borderRadius: 16, padding: 18, borderWidth: 1.5, fontSize: 16, fontWeight: '600', marginBottom: 5 },
  textArea: { height: 140, lineHeight: 24 },
  
  legalWarning: { flexDirection: "row", marginTop: 35, padding: 18, borderRadius: 16, alignItems: "center", gap: 15, borderWidth: 1, borderStyle: 'dashed' },
  legalText: { fontSize: 12, flex: 1, fontStyle: "italic", fontWeight: '700', lineHeight: 18 },
  
  detainBtn: { 
    flexDirection: "row", 
    height: 64, 
    borderRadius: 20, 
    alignItems: "center", 
    justifyContent: "center", 
    marginTop: 40, 
    gap: 12,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
        android: { elevation: 4 },
        web: { boxShadow: "0px 4px 10px rgba(0,0,0,0.15)" }
    })
  },
  detainBtnText: { color: "#FFF", fontWeight: "900", fontSize: 14, letterSpacing: 1 },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, height: "70%", padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, paddingBottom: 15, borderBottomWidth: 1 },
  modalTitle: { fontSize: 13, fontWeight: "900", letterSpacing: 1.5 },
  modalItem: { flexDirection: "row", alignItems: "center", paddingVertical: 20, borderBottomWidth: 1 },
  modalItemText: { fontSize: 16, fontWeight: '700', flex: 1 },
});