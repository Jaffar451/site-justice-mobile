// PATH: src/screens/police/PoliceCustodyScreen.tsx
import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Alert, Switch, Platform, ActivityIndicator, StatusBar,
  KeyboardAvoidingView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture & Store
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { PoliceScreenProps } from "../../types/navigation";

// ✅ UI Components
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Services
import { updateComplaint } from "../../services/complaint.service";

export default function PoliceCustodyScreen({ route, navigation }: PoliceScreenProps<'PoliceCustody'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  
  // 🛡️ Récupération typée des paramètres
  const { complaintId, suspectName = "Individu non identifié" } = route.params;

  const [startTime, setStartTime] = useState<Date | null>(null);
  const [rightsNotified, setRightsNotified] = useState(false);
  const [medicalExamRequested, setMedicalExamRequested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState("00:00:00");

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    divider: isDark ? "#334155" : "#F1F5F9",
    timerBg: isDark ? "#1E1B4B" : "#F8FAFC",
    timerBgActive: isDark ? "#450A0A" : "#FFF1F2",
    timerTextActive: "#EF4444"
  };

  /**
   * 🕒 GESTION DU CHRONOMÈTRE LÉGAL
   */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsed(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime]);

  /**
   * ⚖️ DÉMARRAGE OFFICIEL
   */
  const handleStartCustody = () => {
    if (!complaintId) return Alert.alert("Erreur", "ID de dossier introuvable.");
    
    if (!rightsNotified) {
      return Alert.alert(
        "Notification Obligatoire", 
        "Veuillez notifier les droits au suspect avant de débuter la G.A.V."
      );
    }
    
    Alert.alert(
      "Démarrage G.A.V",
      "L'heure de début légale sera scellée maintenant. Confirmer ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", onPress: () => setStartTime(new Date()) }
      ]
    );
  };

  /**
   * 💾 ENREGISTREMENT API
   */
  const handleSaveAndExit = async () => {
    if (!complaintId) return Alert.alert("Erreur", "ID invalide.");

    try {
      setIsSubmitting(true);
      await updateComplaint(Number(complaintId), {
        status: "garde_a_vue",
        isInCustody: true,
        custodyStart: startTime?.toISOString(),
        rightsNotified,
        medicalExamRequested,
        custodyStatus: "active",
      } as any);

      Alert.alert("Succès", "Le registre de G.A.V a été mis à jour.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erreur", "Échec de la synchronisation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Registre Garde à Vue" showBack={true} />

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollPadding} keyboardShouldPersistTaps="handled">
            
            {/* CARTE SUSPECT */}
            <View style={[styles.suspectCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <View style={[styles.avatarBox, { backgroundColor: primaryColor + "15" }]}>
                <Ionicons name="person" size={30} color={primaryColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.suspectLabel, { color: primaryColor }]}>DÉTENU AU POSTE</Text>
                <Text style={[styles.suspectName, { color: colors.textMain }]}>{suspectName}</Text>
                <Text style={[styles.caseId, { color: colors.textSub }]}>RG-#{complaintId}</Text>
              </View>
            </View>

            {/* CHRONOMÈTRE LÉGAL */}
            <View style={[
                styles.timerContainer, 
                { 
                    backgroundColor: startTime ? colors.timerBgActive : colors.timerBg,
                    borderColor: startTime ? colors.timerTextActive : colors.border 
                }
            ]}>
              <Text style={[styles.timerTitle, { color: startTime ? colors.timerTextActive : colors.textSub }]}>COMPTEUR DE DÉTENTION</Text>
              <Text style={[styles.timerValue, { color: startTime ? colors.timerTextActive : colors.textSub }]}>{elapsed}</Text>
              
              {!startTime ? (
                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={[styles.startBtn, { backgroundColor: primaryColor }]} 
                  onPress={handleStartCustody}
                >
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.btnText}>DÉBUTER LE DÉLAI</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={styles.extendBtn} 
                  onPress={() => {
                    // ✅ FIX TS 2345 : Ajout du paramètre 'caseId' manquant pour satisfaire le type
                    navigation.navigate("PoliceCustodyExtension", { 
                      complaintId: Number(complaintId), 
                      caseId: Number(complaintId), // Requis par navigation.ts
                      suspectName: suspectName 
                    });
                  }}
                >
                  <Text style={styles.extendText}>SOLLICITER PROLONGATION</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* OPTIONS */}
            <View style={[styles.switchRow, { borderBottomColor: colors.divider }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchLabel, { color: colors.textMain }]}>Notification des Droits</Text>
                <Text style={[styles.switchSub, { color: colors.textSub }]}>Signée par le prévenu</Text>
              </View>
              <Switch 
                value={rightsNotified} 
                onValueChange={setRightsNotified} 
                trackColor={{ false: "#CBD5E1", true: "#10B981" }} 
              />
            </View>

            <View style={[styles.switchRow, { borderBottomColor: colors.divider }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchLabel, { color: colors.textMain }]}>Examen Médical</Text>
                <Text style={[styles.switchSub, { color: colors.textSub }]}>Effectué ou refusé</Text>
              </View>
              <Switch 
                value={medicalExamRequested} 
                onValueChange={setMedicalExamRequested} 
                trackColor={{ false: "#CBD5E1", true: primaryColor }} 
              />
            </View>

            {/* VALIDATION */}
            <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.saveBtn, { backgroundColor: primaryColor, opacity: isSubmitting ? 0.6 : 1 }]}
                onPress={handleSaveAndExit}
                disabled={isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="lock-closed" size={20} color="#fff" style={{marginRight: 10}} />
                  <Text style={styles.btnText}>SCELLER LE REGISTRE</Text>
                </>
              )}
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollPadding: { padding: 20, paddingBottom: 120 },
  suspectCard: { flexDirection: 'row', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 25, borderWidth: 1 },
  avatarBox: { width: 55, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  suspectLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  suspectName: { fontSize: 20, fontWeight: '900' },
  caseId: { fontSize: 12, fontWeight: "700", marginTop: 2 },
  timerContainer: { padding: 30, borderRadius: 30, borderWidth: 2, alignItems: 'center', marginBottom: 30, borderStyle: 'dashed' },
  timerTitle: { fontSize: 10, fontWeight: '900', marginBottom: 10, letterSpacing: 1 },
  timerValue: { fontSize: 48, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  startBtn: { marginTop: 20, height: 55, paddingHorizontal: 25, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 3 },
  extendBtn: { marginTop: 20, height: 45, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: "#EAB308", justifyContent: 'center' },
  extendText: { fontWeight: '800', fontSize: 11, color: "#EAB308", textAlign: 'center' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1 },
  switchLabel: { fontSize: 16, fontWeight: '700' },
  switchSub: { fontSize: 12, marginTop: 2 },
  saveBtn: { marginTop: 40, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', elevation: 4 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 15 }
});