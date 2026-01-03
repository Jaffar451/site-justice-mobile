import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Switch, 
  Platform, 
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Imports Architecture Alignés
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { PoliceScreenProps } from "../../types/navigation";

// Composants UI
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { updateComplaint } from "../../services/complaint.service";

export default function PoliceCustodyScreen({ route, navigation }: PoliceScreenProps<'PoliceCustody'>) {
  // ✅ 2. Thème & Auth
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  
  // Récupération sécurisée des paramètres
  const params = route.params as any;
  const complaintId = params?.complaintId || params?.caseId; 
  const suspectName = params?.suspectName || "Individu non identifié";

  const [startTime, setStartTime] = useState<Date | null>(null);
  const [rightsNotified, setRightsNotified] = useState(false);
  const [medicalExamRequested, setMedicalExamRequested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState("00:00:00");

  // 🎨 PALETTE DYNAMIQUE
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

  // ⏱️ Logique du chronomètre légal
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
    if (!rightsNotified) {
      return Alert.alert(
        "Droits non notifiés", 
        "Le Code de Procédure Pénale exige la notification des droits avant le placement effectif en cellule."
      );
    }
    
    Alert.alert(
      "Démarrage de la G.A.V ⚖️",
      "Confirmez-vous l'entrée en cellule ? Cette heure d'enregistrement fera foi devant le Procureur.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Démarrer GAV", onPress: () => setStartTime(new Date()) }
      ]
    );
  };

  const handleSaveAndExit = async () => {
    try {
      setIsSubmitting(true);
      await updateComplaint(complaintId, {
        isInCustody: true,
        custodyStart: startTime?.toISOString(),
        rightsNotified,
        medicalExamRequested,
        custodyStatus: "active",
        notifyingOfficer: `${user?.firstname} ${user?.lastname}`
      } as any);

      if (Platform.OS === 'web') window.alert("Registre Signé numériquement.");
      else Alert.alert("Registre Signé", "Le placement en GAV a été consigné au registre numérique.");
      
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erreur Système", "L'acte n'a pas pu être scellé sur le serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Registre de Garde à Vue" showBack={true} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.bgMain }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollPadding} 
          showsVerticalScrollIndicator={false}
        >
          
          {/* 👤 IDENTITÉ DU GARDE À VUE */}
          <View style={[styles.suspectCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={[styles.avatarBox, { backgroundColor: primaryColor + "15" }]}>
               <Ionicons name="person" size={32} color={primaryColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.suspectLabel, { color: primaryColor }]}>DÉTENU AU POSTE</Text>
              <Text style={[styles.suspectName, { color: colors.textMain }]}>{suspectName.toUpperCase()}</Text>
              <Text style={[styles.caseId, { color: colors.textSub }]}>Dossier RG #{complaintId}</Text>
            </View>
          </View>

          {/* ⏳ CHRONOMÈTRE LÉGAL */}
          <View style={[
              styles.timerContainer, 
              { 
                  backgroundColor: startTime ? colors.timerBgActive : colors.timerBg,
                  borderColor: startTime ? colors.timerTextActive : colors.border 
              }
          ]}>
            <Text style={[styles.timerTitle, { color: startTime ? colors.timerTextActive : colors.textSub }]}>
                TEMPS DE DÉTENTION ÉCOULÉ
            </Text>
            <Text style={[styles.timerValue, { color: startTime ? colors.timerTextActive : (isDark ? colors.border : "#CBD5E1") }]}>
              {elapsed}
            </Text>
            
            {!startTime ? (
              <TouchableOpacity 
                  activeOpacity={0.8}
                  style={[styles.startBtn, { backgroundColor: primaryColor }]} 
                  onPress={handleStartCustody}
              >
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.btnText}>DÉBUTER LA G.A.V</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                  activeOpacity={0.8}
                  style={styles.extendBtn} 
                  onPress={() => navigation.navigate("PoliceCustodyExtension", { caseId: complaintId, suspectName })}
              >
                <Ionicons name="hourglass-outline" size={18} color="#EAB308" />
                <Text style={styles.extendText}>SOLLICITER PROLONGATION</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ⚖️ FORMALITÉS DE CONFORMITÉ */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Validité de la procédure</Text>
          
          <View style={[styles.switchRow, { borderBottomColor: colors.divider }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, { color: colors.textMain }]}>Notification des Droits</Text>
              <Text style={[styles.switchSub, { color: colors.textSub }]}>Suspect informé de ses droits</Text>
            </View>
            <Switch 
              value={rightsNotified} 
              onValueChange={setRightsNotified}
              trackColor={{ false: isDark ? "#334155" : "#CBD5E1", true: "#10B981" }}
              thumbColor={Platform.OS === 'ios' ? undefined : (rightsNotified ? "#fff" : "#f4f3f4")}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomColor: colors.divider }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, { color: colors.textMain }]}>Examen Médical</Text>
              <Text style={[styles.switchSub, { color: colors.textSub }]}>Droit à un médecin notifié</Text>
            </View>
            <Switch 
              value={medicalExamRequested} 
              onValueChange={setMedicalExamRequested}
              trackColor={{ false: isDark ? "#334155" : "#CBD5E1", true: primaryColor }}
              thumbColor={Platform.OS === 'ios' ? undefined : (medicalExamRequested ? "#fff" : "#f4f3f4")}
            />
          </View>

          {/* 🛡️ AVIS AUTOMATIQUE */}
          <View style={[styles.legalNote, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
              <Ionicons name="shield-checkmark" size={22} color={primaryColor} />
              <Text style={[styles.legalText, { color: colors.textSub }]}>
                  Le scellement génère un avis automatique de placement en GAV au Procureur de la République.
              </Text>
          </View>

          {/* 💾 SIGNATURE NUMÉRIQUE */}
          <TouchableOpacity 
              activeOpacity={0.85}
              style={[styles.saveBtn, { backgroundColor: primaryColor }]}
              onPress={handleSaveAndExit}
              disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : (
              <>
                  <Ionicons name="save-outline" size={22} color="#fff" />
                  <Text style={styles.btnText}>SCELLER LE REGISTRE</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
      
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollPadding: { padding: 20, paddingBottom: 140 },
  suspectCard: { flexDirection: 'row', padding: 22, borderRadius: 24, alignItems: 'center', marginBottom: 30, borderWidth: 1.5 },
  avatarBox: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 18 },
  suspectLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 1.5 },
  suspectName: { fontSize: 24, fontWeight: '900', marginTop: 3, letterSpacing: -0.5 },
  caseId: { fontSize: 13, fontWeight: "700", marginTop: 5 },
  
  timerContainer: { 
    padding: 35, borderRadius: 36, borderWidth: 3, alignItems: 'center', 
    marginBottom: 35, borderStyle: 'dashed' 
  },
  timerTitle: { fontSize: 10, fontWeight: '900', marginBottom: 15, letterSpacing: 1.5 },
  timerValue: { fontSize: 54, fontWeight: '900', letterSpacing: 2 },
  
  startBtn: { marginTop: 25, height: 60, paddingHorizontal: 35, borderRadius: 22, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 4 },
  extendBtn: { 
    marginTop: 25, height: 50, paddingHorizontal: 22, borderRadius: 16, 
    borderWidth: 2, borderColor: "#EAB308", flexDirection: 'row', alignItems: 'center', gap: 10 
  },
  extendText: { fontWeight: '900', fontSize: 12, color: "#EAB308" },
  
  sectionTitle: { fontSize: 11, fontWeight: '900', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1.5 },
  switchLabel: { fontSize: 16, fontWeight: '800' },
  switchSub: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  
  legalNote: { flexDirection: 'row', padding: 22, borderRadius: 22, marginTop: 35, gap: 15, alignItems: 'center' },
  legalText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 },

  saveBtn: { marginTop: 45, height: 64, borderRadius: 22, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 15, elevation: 8 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 1 }
});