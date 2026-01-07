import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Alert, Switch, Platform, ActivityIndicator, StatusBar,
  KeyboardAvoidingView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { PoliceScreenProps } from "../../types/navigation";

import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Service de mise à jour sécurisé
import { updateComplaint } from "../../services/complaint.service";

export default function PoliceCustodyScreen({ route, navigation }: PoliceScreenProps<'PoliceCustody'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  
  // 🛡️ Récupération des paramètres (avec repli si undefined)
  const params = route.params as any;
  const complaintId = params?.complaintId || params?.caseId; 
  const suspectName = params?.suspectName || "Individu non identifié";

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

  // Gestion du chronomètre légal
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

  const handleStartCustody = () => {
    if (!complaintId) return Alert.alert("Erreur", "ID de dossier introuvable.");
    
    if (!rightsNotified) {
      return Alert.alert(
        "Droits non notifiés", 
        "La loi exige la notification des droits avant le placement en cellule."
      );
    }
    
    Alert.alert(
      "Démarrage de la G.A.V ⚖️",
      "L'heure de début sera enregistrée officiellement.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", onPress: () => setStartTime(new Date()) }
      ]
    );
  };

  const handleSaveAndExit = async () => {
    if (!complaintId || complaintId === 'undefined') {
      return Alert.alert("Erreur", "Identifiant de dossier invalide.");
    }

    try {
      setIsSubmitting(true);
      await updateComplaint(Number(complaintId), {
        status: "en_cours_OPJ",
        isInCustody: true,
        custodyStart: startTime?.toISOString(),
        rightsNotified,
        medicalExamRequested,
        custodyStatus: "active",
        notifyingOfficer: `${user?.firstname} ${user?.lastname}`
      } as any);

      Alert.alert("Succès", "Le registre a été scellé numériquement.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de synchroniser avec le serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Registre G.A.V" showBack={true} />

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollPadding}
            keyboardShouldPersistTaps="handled" // ✅ Permet de cliquer sur les boutons même si le clavier est ouvert
          >
            {/* CARTE SUSPECT */}
            <View style={[styles.suspectCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <View style={[styles.avatarBox, { backgroundColor: primaryColor + "15" }]}>
                <Ionicons name="person" size={32} color={primaryColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.suspectLabel, { color: primaryColor }]}>DÉTENU AU POSTE</Text>
                <Text style={[styles.suspectName, { color: colors.textMain }]}>{suspectName}</Text>
                <Text style={[styles.caseId, { color: colors.textSub }]}>Dossier #{complaintId}</Text>
              </View>
            </View>

            {/* TIMER */}
            <View style={[
                styles.timerContainer, 
                { 
                    backgroundColor: startTime ? colors.timerBgActive : colors.timerBg,
                    borderColor: startTime ? colors.timerTextActive : colors.border 
                }
            ]}>
              <Text style={[styles.timerTitle, { color: startTime ? colors.timerTextActive : colors.textSub }]}>DURÉE DE DÉTENTION</Text>
              <Text style={[styles.timerValue, { color: startTime ? colors.timerTextActive : colors.textSub }]}>{elapsed}</Text>
              
              {!startTime ? (
                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={[styles.startBtn, { backgroundColor: primaryColor }]} 
                  onPress={handleStartCustody}
                >
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.btnText}>DÉBUTER LA G.A.V</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={styles.extendBtn} 
                  onPress={() => navigation.navigate("PoliceCustodyExtension", { caseId: complaintId, suspectName })}
                >
                  <Text style={styles.extendText}>SOLLICITER PROLONGATION</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* SWITCHES */}
            <View style={[styles.switchRow, { borderBottomColor: colors.divider }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchLabel, { color: colors.textMain }]}>Notification des Droits</Text>
                <Text style={[styles.switchSub, { color: colors.textSub }]}>Obligatoire avant détention</Text>
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
                <Text style={[styles.switchSub, { color: colors.textSub }]}>Proposé au suspect</Text>
              </View>
              <Switch 
                value={medicalExamRequested} 
                onValueChange={setMedicalExamRequested} 
                trackColor={{ false: "#CBD5E1", true: primaryColor }} 
              />
            </View>

            {/* BOUTON SCELLER */}
            <TouchableOpacity 
                activeOpacity={0.8}
                style={[
                  styles.saveBtn, 
                  { backgroundColor: primaryColor, opacity: isSubmitting ? 0.6 : 1 }
                ]}
                onPress={handleSaveAndExit}
                disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={20} color="#fff" style={{marginRight: 8}} />
                  <Text style={styles.btnText}>SCELLER LE REGISTRE</Text>
                </>
              )}
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      
      {/* Footer séparé du ScrollView pour ne pas gêner le tactile */}
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollPadding: { padding: 20, paddingBottom: 120 },
  suspectCard: { flexDirection: 'row', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 25, borderWidth: 1 },
  avatarBox: { width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  suspectLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  suspectName: { fontSize: 22, fontWeight: '900' },
  caseId: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  timerContainer: { padding: 30, borderRadius: 30, borderWidth: 2, alignItems: 'center', marginBottom: 30, borderStyle: 'dashed' },
  timerTitle: { fontSize: 10, fontWeight: '900', marginBottom: 10, letterSpacing: 1 },
  timerValue: { fontSize: 48, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  startBtn: { marginTop: 20, height: 55, paddingHorizontal: 30, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 3 },
  extendBtn: { marginTop: 20, height: 45, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: "#EAB308", justifyContent: 'center' },
  extendText: { fontWeight: '800', fontSize: 12, color: "#EAB308", textAlign: 'center' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1 },
  switchLabel: { fontSize: 16, fontWeight: '700' },
  switchSub: { fontSize: 12, marginTop: 2 },
  saveBtn: { 
    marginTop: 40, 
    height: 60, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexDirection: 'row',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 0.5 }
});