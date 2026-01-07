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
import { useAppTheme } from "../../theme/AppThemeProvider";
import { ProsecutorScreenProps } from "../../types/navigation";

// Composants UI
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { getComplaintById, assignToJudge, Complaint } from "../../services/complaint.service";

// Liste institutionnelle des cabinets
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
  
  // 🛡️ RÉCUPÉRATION SÉCURISÉE DES PARAMS
  const rawCaseId = route.params?.caseId;
  // Correction de l'erreur 2367 et de la faute de frappe CaseId -> rawCaseId
  const caseId = rawCaseId && !isNaN(Number(rawCaseId)) ? Number(rawCaseId) : null;
  
  const [selectedJudge, setSelectedJudge] = useState<number | null>(null);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    accent: "#7C2D12", // Couleur Terre (Justice)
  };

  // 📥 RÉCUPÉRATION DU DOSSIER
  const { data: complaint, isLoading } = useQuery<Complaint>({
    queryKey: ["complaint", caseId],
    queryFn: () => getComplaintById(caseId as number),
    enabled: caseId !== null, // Plus besoin de comparer à 'undefined'
  });

  // ⚖️ MUTATION : Saisine du Cabinet
  const mutation = useMutation({
    mutationFn: (judgeId: number) => assignToJudge(caseId as number, judgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prosecutor-cases"] });
      
      const successMsg = "Réquisitoire Introductif transmis au Cabinet d'Instruction.";
      if (Platform.OS === 'web') {
        window.alert(`✅ SUCCÈS : ${successMsg}`);
        navigation.popToTop();
      } else {
        Alert.alert("Saisine Enregistrée ⚖️", successMsg, [
          { text: "Terminer", onPress: () => navigation.popToTop() }
        ]);
      }
    },
    onError: (err: any) => {
      Alert.alert("Échec de saisine", err.response?.data?.message || "Erreur de liaison serveur.");
    }
  });

  const handleConfirm = () => {
    if (!selectedJudge) {
        return Alert.alert("Attention", "Veuillez désigner un Cabinet d'Instruction.");
    }
    
    const judge = CABINETS_LIST.find(j => j.id === selectedJudge);

    Alert.alert(
      "Confirmation de Saisine", 
      `Désigner le ${judge?.cabinet} pour l'instruction de l'affaire n°${caseId} ?`, 
      [
        { text: "Réviser", style: "cancel" },
        { 
          text: "Confirmer la saisine", 
          onPress: () => mutation.mutate(selectedJudge),
          style: "default"
        }
      ]
    );
  };

  if (isLoading) return (
    <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={{ marginTop: 10, color: colors.textSub }}>Accès au dossier pénal...</Text>
    </View>
  );

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Désignation du Juge" showBack={true} />
      
      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <ScrollView 
          contentContainerStyle={styles.scrollPadding} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* 📜 RÉSUMÉ DE L'AFFAIRE */}
          <View style={[styles.requisitoireBox, { backgroundColor: colors.bgCard, borderLeftColor: colors.accent, borderColor: colors.border }]}>
            <View style={styles.headerRow}>
                <Ionicons name="ribbon" size={20} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.accent }]}>RÉQUISITOIRE INTRODUCTIF</Text>
            </View>
            
            <Text style={[styles.prosecutorMention, { color: colors.textSub }]}>
              Par le Procureur : <Text style={styles.boldText}>M. {user?.lastname?.toUpperCase()}</Text>
            </Text>

            <Text style={[styles.offenceTitle, { color: colors.textMain }]}>
                {complaint?.provisionalOffence || "Infraction non spécifiée"}
            </Text>
            <Text style={[styles.descriptionText, { color: colors.textSub }]} numberOfLines={3}>
                {complaint?.description}
            </Text>
            
            <View style={[styles.caseBadge, { backgroundColor: colors.accent + "15" }]}>
              <Text style={[styles.caseBadgeText, { color: colors.accent }]}>RG-#{caseId}/26</Text>
            </View>
          </View>

          <Text style={[styles.mainLabel, { color: colors.textMain }]}>Cabinet d'Instruction compétent</Text>
          <Text style={[styles.subLabel, { color: colors.textSub }]}>Sélectionnez le juge d'instruction pour ce dossier.</Text>

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
                      { backgroundColor: colors.bgCard, borderColor: isSelected ? primaryColor : colors.border },
                      isSelected && { backgroundColor: primaryColor + '10' }
                  ]}
                  onPress={() => setSelectedJudge(judge.id)}
                >
                  <View style={styles.judgeInfo}>
                    <View style={[styles.iconCircle, { backgroundColor: isSelected ? primaryColor : (isDark ? "#334155" : "#F1F5F9") }]}>
                        <Ionicons name="briefcase" size={20} color={isSelected ? "#FFF" : colors.textSub} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.judgeName, { color: colors.textMain }]}>{judge.name}</Text>
                      <Text style={[styles.cabinetText, { color: colors.textSub }]}>{judge.cabinet}</Text>
                    </View>
                  </View>
                  <Ionicons 
                    name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                    size={26} 
                    color={isSelected ? primaryColor : colors.border} 
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 🚀 ACTION FINALE */}
          <TouchableOpacity 
            activeOpacity={0.85}
            style={[styles.mainBtn, { backgroundColor: primaryColor, opacity: mutation.isPending ? 0.7 : 1 }]} 
            onPress={handleConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <ActivityIndicator color="#fff" /> : (
              <>
                <Text style={styles.btnText}>VALIDER LA SAISINE</Text>
                <Ionicons name="send" size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
          
        </ScrollView>
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollPadding: { padding: 20, paddingBottom: 140 },
  requisitoireBox: { padding: 20, borderRadius: 24, marginBottom: 30, borderLeftWidth: 8, borderWidth: 1, elevation: 3 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: "900", letterSpacing: 1, textTransform: 'uppercase' },
  prosecutorMention: { fontSize: 13, marginBottom: 15 },
  boldText: { fontWeight: '900' },
  offenceTitle: { fontWeight: "900", fontSize: 20, marginBottom: 8 },
  descriptionText: { fontSize: 14, lineHeight: 20 },
  caseBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 15 },
  caseBadgeText: { fontSize: 11, fontWeight: '900' },
  mainLabel: { fontSize: 18, fontWeight: "900", marginBottom: 5 },
  subLabel: { fontSize: 13, marginBottom: 20, opacity: 0.8 },
  judgeList: { gap: 12 },
  judgeCard: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 22, borderWidth: 2 },
  judgeInfo: { flexDirection: "row", alignItems: "center", gap: 15, flex: 1 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  judgeName: { fontSize: 16, fontWeight: "800" },
  cabinetText: { fontSize: 12, marginTop: 2, fontWeight: "600" },
  mainBtn: { 
    height: 64, 
    borderRadius: 22, 
    flexDirection: 'row', 
    alignItems: "center", 
    justifyContent: 'center', 
    gap: 12, 
    marginTop: 35,
    elevation: 4
  },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 15, letterSpacing: 0.5 },
});