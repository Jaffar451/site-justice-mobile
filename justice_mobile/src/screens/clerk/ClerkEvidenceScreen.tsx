import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

// ✅ 1. Architecture & Thème
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { ClerkScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

interface EvidenceItem {
  id: string;
  sealNumber: string; 
  type: "DOCUMENT" | "WEAPON" | "DRUG" | "DIGITAL" | "OTHER";
  description: string;
  depositDate: string;
}

export default function ClerkEvidenceScreen() {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const { user } = useAuthStore();
  const route = useRoute<any>();
  const { caseId } = route.params || { caseId: "N/A" };

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#F1F5F9",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
  };

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([
    { id: "1", sealNumber: "SC-2025-001", type: "WEAPON", description: "Couteau de cuisine manche noir, lame 15cm", depositDate: "24/12/2025" },
    { id: "2", sealNumber: "SC-2025-002", type: "DIGITAL", description: "Clé USB 64Go, contenant fichiers logs", depositDate: "25/12/2025" },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newSeal, setNewSeal] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<EvidenceItem["type"]>("OTHER");

  const handleAddEvidence = () => {
    if (!newSeal.trim() || !newDesc.trim()) {
      const msg = "Le numéro de scellé et la description sont obligatoires.";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Champs requis", msg);
      return;
    }

    const newItem: EvidenceItem = {
      id: Date.now().toString(),
      sealNumber: newSeal.toUpperCase(),
      description: newDesc.trim(),
      type: newType,
      depositDate: new Date().toLocaleDateString("fr-FR")
    };

    setEvidenceList([newItem, ...evidenceList]);
    setModalVisible(false);
    resetForm();
    if (Platform.OS === 'web') window.alert("✅ Pièce inscrite au registre des scellés.");
  };

  const resetForm = () => {
    setNewSeal("");
    setNewDesc("");
    setNewType("OTHER");
  };

  const getIconInfo = (type: string) => {
    switch (type) {
      case "WEAPON": return { icon: "flash-outline", color: "#EF4444", label: "Arme" };
      case "DRUG": return { icon: "flask-outline", color: "#F59E0B", label: "Stupéfiant" };
      case "DIGITAL": return { icon: "hardware-chip-outline", color: "#3B82F6", label: "Numérique" };
      case "DOCUMENT": return { icon: "document-text-outline", color: "#8B5CF6", label: "Document" };
      default: return { icon: "cube-outline", color: "#64748B", label: "Divers" };
    }
  };

  const renderItem = ({ item }: { item: EvidenceItem }) => {
    const info = getIconInfo(item.type);
    return (
      <View style={[styles.card, { backgroundColor: colors.bgCard, borderLeftColor: info.color, borderColor: colors.border }]}>
        <View style={[styles.iconBox, { backgroundColor: info.color + "15" }]}>
          <Ionicons name={info.icon as any} size={22} color={info.color} />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.sealNum, { color: colors.textMain }]}>{item.sealNumber}</Text>
            <View style={[styles.badge, { backgroundColor: info.color + "15" }]}>
              <Text style={[styles.badgeText, { color: info.color }]}>{info.label.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={[styles.descText, { color: colors.textSub }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.dateText, { color: colors.textSub }]}>📅 Déposé le {item.depositDate}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title={`Scellés RG #${caseId}`} showBack={true} />
      
      <View style={[styles.mainWrapper, { backgroundColor: colors.bgMain }]}>
        <FlatList
          data={evidenceList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[styles.headerInfo, { backgroundColor: primaryColor + "15" }]}>
              <Ionicons name="information-circle-outline" size={20} color={primaryColor} />
              <Text style={[styles.headerInfoText, { color: isDark ? "#BAE6FD" : "#475569" }]}>
                Inventaire officiel des pièces à conviction enregistrées pour cette procédure.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="archive-outline" size={60} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucun scellé dans ce dossier.</Text>
            </View>
          }
        />

        <TouchableOpacity 
          activeOpacity={0.9}
          style={[styles.fab, { backgroundColor: primaryColor }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* --- MODAL D'ENREGISTREMENT --- */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard }]}>
            <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textMain }]}>Nouvel Enregistrement</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color={colors.textSub} />
                </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={[styles.label, { color: colors.textSub }]}>Numéro de Scellé (Étiquette) *</Text>
              <TextInput 
                style={[styles.input, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                placeholder="Ex: SC-2025-001"
                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                value={newSeal}
                onChangeText={setNewSeal}
                autoCapitalize="characters"
              />

              <Text style={[styles.label, { color: colors.textSub }]}>Désignation de la pièce *</Text>
              <TextInput 
                style={[styles.input, styles.textArea, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                placeholder="Ex: Arme blanche, documents comptables, etc..."
                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                multiline
                numberOfLines={3}
                value={newDesc}
                onChangeText={setNewDesc}
                textAlignVertical="top"
              />

              <Text style={[styles.label, { color: colors.textSub }]}>Nature de l'objet</Text>
              <View style={styles.typeGrid}>
                {(["DOCUMENT", "WEAPON", "DRUG", "DIGITAL", "OTHER"] as const).map((t) => {
                  const isSelected = newType === t;
                  const info = getIconInfo(t);
                  return (
                    <TouchableOpacity 
                      key={t}
                      onPress={() => setNewType(t)}
                      style={[
                        styles.typeBtn, 
                        { 
                          backgroundColor: isSelected ? info.color : colors.inputBg,
                          borderColor: isSelected ? info.color : colors.border
                        }
                      ]}
                    >
                      <Ionicons name={info.icon as any} size={18} color={isSelected ? "#FFF" : info.color} />
                      <Text style={[styles.typeBtnText, { color: isSelected ? "#FFF" : colors.textSub }]}>{info.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity onPress={handleAddEvidence} style={[styles.confirmBtn, { backgroundColor: primaryColor }]}>
                <Text style={styles.confirmBtnText}>CERTIFIER L'INSCRIPTION</Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 160 },
  headerInfo: { flexDirection: "row", padding: 16, borderRadius: 20, marginBottom: 25, alignItems: "center" },
  headerInfoText: { marginLeft: 10, fontSize: 12, flex: 1, fontWeight: "600", lineHeight: 18 },

  card: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderLeftWidth: 8,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.08)" }
    })
  },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: "center", alignItems: "center", marginRight: 16 },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sealNum: { fontWeight: "900", fontSize: 16, letterSpacing: 0.5 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 9, fontWeight: "900" },
  descText: { fontSize: 14, marginBottom: 12, lineHeight: 20, fontWeight: "500" },
  divider: { height: 1, marginBottom: 10 },
  dateText: { fontSize: 11, fontWeight: "800", opacity: 0.8 },

  emptyContainer: { alignItems: "center", marginTop: 120 },
  emptyText: { marginTop: 15, fontSize: 14, fontWeight: "700" },

  fab: {
    position: "absolute", bottom: 100, right: 20, width: 64, height: 64, borderRadius: 22,
    justifyContent: "center", alignItems: "center", elevation: 8, zIndex: 99
  },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContent: { padding: 24, borderTopLeftRadius: 36, borderTopRightRadius: 36, maxHeight: "90%" },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: "900" },
  
  label: { fontSize: 10, fontWeight: "900", marginBottom: 10, marginTop: 15, textTransform: "uppercase", letterSpacing: 1 },
  input: { borderWidth: 1.5, borderRadius: 16, padding: 16, fontSize: 15, fontWeight: "600" },
  textArea: { minHeight: 100 },
  
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 5 },
  typeBtn: { width: "31%", paddingVertical: 18, borderRadius: 16, borderWidth: 1.5, alignItems: "center", gap: 8 },
  typeBtnText: { fontSize: 10, fontWeight: '900' },

  confirmBtn: { marginTop: 35, padding: 20, borderRadius: 20, alignItems: "center", ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10 }, android: { elevation: 4 } }) },
  confirmBtnText: { color: "#FFF", fontWeight: "900", letterSpacing: 1.5, fontSize: 14 }
});