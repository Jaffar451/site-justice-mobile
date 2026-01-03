import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  StatusBar,
  Platform
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture & Store
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { ProsecutorScreenProps } from "../../types/navigation";

// Composants UI
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { getComplaintById, assignToJudge, Complaint } from "../../services/complaint.service";

const CABINETS_LIST = [
  { id: 101, name: "M. le Juge Moussa Garba", cabinet: "1er Cabinet d'Instruction" },
  { id: 102, name: "Mme la Juge Fati Sidikou", cabinet: "2ème Cabinet d'Instruction" },
  { id: 103, name: "M. le Juge Issa Soumana", cabinet: "3ème Cabinet d'Instruction" },
  { id: 104, name: "Mme la Juge Balkissa Adamou", cabinet: "4ème Cabinet d'Instruction" },
];

export default function ProsecutorAssignJudgeScreen({ route, navigation }: ProsecutorScreenProps<'ProsecutorAssignJudge'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore(); 
  const queryClient = useQueryClient();
  
  const { caseId } = route.params; 
  const [selectedJudge, setSelectedJudge] = useState<number | null>(null);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    divider: isDark ? "#334155" : "#F1F5F9",
  };

  // 📥 Récupération du dossier
  const { data: complaint, isLoading } = useQuery<Complaint>({
    queryKey: ["complaint", caseId],
    queryFn: () => getComplaintById(caseId),
    enabled: !!caseId,
  });

  // ⚖️ Mutation : Transmission au Cabinet
  const mutation = useMutation({
    mutationFn: (judgeId: number) => assignToJudge(caseId, judgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prosecutor-cases"] });
      if (Platform.OS === 'web') window.alert("✅ Saisine Enregistrée : Le dossier a été transmis.");
      else {
          Alert.alert(
            "Saisine Enregistrée ⚖️", 
            "Le Réquisitoire Introductif a été transmis au Cabinet d'Instruction.",
            [{ text: "Terminer", onPress: () => navigation.popToTop() }]
          );
      }
      if (Platform.OS === 'web') navigation.popToTop();
    },
  });

  const handleConfirm = () => {
    if (!selectedJudge) {
        const msg = "Veuillez désigner un Cabinet d'Instruction.";
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Attention", msg);
        return;
    }
    const judge = CABINETS_LIST.find(j => j.id === selectedJudge);

    Alert.alert(
      "Confirmation de Saisine", 
      `Désigner le ${judge?.cabinet} pour l'instruction du dossier RG ${caseId} ?`, 
      [
        { text: "Modifier", style: "cancel" },
        { text: "Confirmer", onPress: () => mutation.mutate(selectedJudge) }
      ]
    );
  };

  if (isLoading) return (
    <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
        <ActivityIndicator size="large" color={primaryColor} />
    </View>
  );

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Saisine du Juge" showBack={true} />
      
      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.scrollPadding} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* 📜 CADRE DU RÉQUISITOIRE INTRODUCTIF */}
        <View style={[styles.requisitoireBox, { backgroundColor: colors.bgCard, borderLeftColor: primaryColor, borderColor: colors.border }]}>
          <View style={styles.headerRow}>
              <Ionicons name="ribbon" size={20} color={primaryColor} />
              <Text style={[styles.sectionTitle, { color: primaryColor }]}>RÉQUISITOIRE INTRODUCTIF</Text>
          </View>
          
          <Text style={[styles.prosecutorMention, { color: colors.textSub }]}>
            Magistrat Requérant : <Text style={[styles.boldText, { color: colors.textMain }]}>Procureur {(user as any)?.lastname?.toUpperCase() || "de la République"}</Text>
          </Text>

          <Text style={[styles.offenceTitle, { color: colors.textMain }]}>{complaint?.provisionalOffence || "Qualification Criminelle"}</Text>
          <Text style={[styles.descriptionText, { color: colors.textSub }]} numberOfLines={3}>{complaint?.description}</Text>
          
          <View style={[styles.caseBadge, { backgroundColor: primaryColor + "15" }]}>
            <Text style={[styles.caseBadgeText, { color: primaryColor }]}>DOSSIER N° RG {caseId}/2025</Text>
          </View>
        </View>

        <Text style={[styles.mainLabel, { color: colors.textMain }]}>Désignation du Cabinet</Text>
        <Text style={[styles.subLabel, { color: colors.textSub }]}>Veuillez sélectionner le cabinet d'instruction compétent pour ce dossier.</Text>

        {/* 🏛️ LISTE DES CABINETS */}
        <View style={styles.judgeList}>
          {CABINETS_LIST.map((judge) => {
            const isSelected = selectedJudge === judge.id;
            return (
              <TouchableOpacity 
                key={judge.id}
                activeOpacity={0.8}
                style={[
                    styles.judgeCard, 
                    { backgroundColor: colors.bgCard, borderColor: colors.border },
                    isSelected && { borderColor: primaryColor, backgroundColor: primaryColor + '10' }
                ]}
                onPress={() => setSelectedJudge(judge.id)}
              >
                <View style={styles.judgeInfo}>
                  <View style={[styles.iconCircle, { backgroundColor: isSelected ? primaryColor : (isDark ? "#334155" : "#F1F5F9") }]}>
                      <Ionicons name="business" size={20} color={isSelected ? "#FFF" : colors.textSub} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.judgeName, { color: colors.textMain }]}>{judge.name}</Text>
                    <Text style={[styles.cabinetText, { color: colors.textSub }]}>{judge.cabinet}</Text>
                  </View>
                </View>
                <Ionicons name={isSelected ? "radio-button-on" : "radio-button-off"} size={24} color={isSelected ? primaryColor : colors.border} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 🚀 BOUTON DE TRANSMISSION SOLENNEL */}
        <TouchableOpacity 
          activeOpacity={0.85}
          style={[styles.mainBtn, { backgroundColor: primaryColor }]} 
          onPress={handleConfirm}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={styles.btnText}>VALIDER ET TRANSMETTRE L'ACTE</Text>
              <Ionicons name="shield-checkmark" size={22} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.legalNotice}>
            <Ionicons name="lock-closed" size={14} color={colors.textSub} />
            <Text style={[styles.noticeText, { color: colors.textSub }]}>Acte certifié numériquement - Direction des Affaires Criminelles.</Text>
        </View>
        
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollPadding: { padding: 20, paddingBottom: 140 },
  requisitoireBox: { padding: 20, borderRadius: 24, marginBottom: 30, borderLeftWidth: 6, borderWidth: 1, elevation: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: "900", letterSpacing: 1.5, textTransform: 'uppercase' },
  prosecutorMention: { fontSize: 13, marginBottom: 15 },
  boldText: { fontWeight: '900' },
  offenceTitle: { fontWeight: "900", fontSize: 20, marginBottom: 8 },
  descriptionText: { fontSize: 14, lineHeight: 20 },
  caseBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginTop: 15 },
  caseBadgeText: { fontSize: 10, fontWeight: '900' },
  mainLabel: { fontSize: 18, fontWeight: "900", marginBottom: 5 },
  subLabel: { fontSize: 13, marginBottom: 20 },
  judgeList: { gap: 10 },
  judgeCard: { flexDirection: "row", alignItems: "center", padding: 15, borderRadius: 20, borderWidth: 1 },
  judgeInfo: { flexDirection: "row", alignItems: "center", gap: 15, flex: 1 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  judgeName: { fontSize: 15, fontWeight: "800" },
  cabinetText: { fontSize: 12, marginTop: 2 },
  mainBtn: { 
    height: 64, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: "center", 
    justifyContent: 'center', 
    gap: 15, 
    marginTop: 40,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10 },
        android: { elevation: 6 }
    })
  },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 14, letterSpacing: 1 },
  legalNotice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 25, opacity: 0.7 },
  noticeText: { fontSize: 10, fontWeight: '700' },
});