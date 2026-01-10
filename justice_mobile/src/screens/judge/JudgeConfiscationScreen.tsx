// PATH: src/screens/judge/JudgeConfiscationScreen.tsx
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
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture & Logic
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { JudgeScreenProps } from "../../types/navigation";

// ✅ UI Components
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Services
import { updateDecision } from "../../services/decision.service"; 

type AssetType = "MONEY" | "VEHICLE" | "WEAPON" | "DRUGS" | "OTHER";

export interface ConfiscatedItem {
  id: string;
  description: string;
  type: AssetType;
  action: "CONFISCATE" | "DESTROY";
}

export default function JudgeConfiscationScreen({ route, navigation }: JudgeScreenProps<'JudgeConfiscation'>) {
  const { theme, isDark } = useAppTheme();
  
  // ✅ Identité Cabinet d'Instruction
  const JUDGE_ACCENT = "#7C3AED"; 
  const { user } = useAuthStore();
  
  // Récupération sécurisée des paramètres
  const caseId = route.params?.caseId || 0;

  const [itemDesc, setItemDesc] = useState("");
  const [selectedType, setSelectedType] = useState<AssetType>("OTHER");
  const [selectedAction, setSelectedAction] = useState<"CONFISCATE" | "DESTROY">("CONFISCATE");

  const [items, setItems] = useState<ConfiscatedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
  };

  /**
   * ➕ AJOUT D'UN ÉLÉMENT À L'ORDONNANCE
   */
  const handleAddItem = () => {
    if (!itemDesc.trim()) {
      return Alert.alert("Désignation requise", "Veuillez décrire précisément le bien scellé.");
    }
    const newItem: ConfiscatedItem = {
      id: Date.now().toString(),
      description: itemDesc.trim(),
      type: selectedType,
      action: selectedAction,
    };
    setItems([...items, newItem]);
    setItemDesc(""); 
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  /**
   * ✍️ SIGNATURE DE L'ORDONNANCE DE SORT DES SCELLÉS
   */
  const handleFinalizeConfiscation = async () => {
    if (items.length === 0) {
      return Alert.alert("Ordonnance vide", "Veuillez lister au moins un scellé pour signer cet acte.");
    }

    const title = "Signer l'Ordonnance ⚖️";
    const msg = `Vous allez statuer sur le sort de ${items.length} scellé(s). Cet acte est immédiatement exécutoire par le Greffe. Confirmer ?`;

    if (Platform.OS === 'web') {
        if (window.confirm(`${title} : ${msg}`)) executeFinalize();
    } else {
        Alert.alert(title, msg, [
          { text: "Réviser", style: "cancel" },
          { text: "Signer l'Acte", onPress: executeFinalize },
        ]);
    }
  };

  const executeFinalize = async () => {
    setLoading(true);
    try {
      // ✅ Simulation d'appel API de mise à jour du dossier
      const payload = {
        confiscations: items,
        confiscationDate: new Date().toISOString(),
        judgeSignature: `SIG-J-${user?.id}-${caseId}`,
      };
      
      // await updateDecision(caseId, payload); 
      
      Alert.alert("Acte Scellé ✅", "L'ordonnance sur le sort des scellés a été transmise au service des domaines et au Greffe.");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Erreur", "L'enregistrement de l'ordonnance a échoué.");
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: AssetType) => {
    const labels = {
      MONEY: "Valeurs / Numéraire",
      VEHICLE: "Moyen de Transport",
      WEAPON: "Arme / Munition",
      DRUGS: "Produits Interdits",
      OTHER: "Autre bien meuble"
    };
    return labels[type];
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Sort des Scellés" showBack={true} />
      
      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* 🏛️ RÉFÉRENCE DU CABINET */}
        <View style={[styles.infoBox, { borderLeftColor: JUDGE_ACCENT, backgroundColor: colors.bgCard }]}>
          <Text style={[styles.infoText, { color: colors.textMain }]}>
            Dossier N° RP-{caseId}/26
          </Text>
          <Text style={[styles.infoSub, { color: colors.textSub }]}>
            Magistrat : M. le Juge {user?.lastname?.toUpperCase()}
          </Text>
        </View>

        

        {/* 📝 FORMULAIRE DE SAISIE DE L'ACTE */}
        <View style={[styles.formCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: JUDGE_ACCENT }]}>DÉSIGNATION DU BIEN</Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textMain }]}
            placeholder="Ex: Véhicule TOYOTA immatriculé NH-4022..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            value={itemDesc}
            onChangeText={setItemDesc}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>CATÉGORIE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                {(["MONEY", "VEHICLE", "WEAPON", "DRUGS", "OTHER"] as AssetType[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                        styles.chip, 
                        { backgroundColor: selectedType === t ? JUDGE_ACCENT : colors.bgMain, borderColor: colors.border }
                    ]}
                    onPress={() => setSelectedType(t)}
                  >
                    <Ionicons 
                      name={t === "MONEY" ? "cash-outline" : t === "VEHICLE" ? "car-outline" : t === "WEAPON" ? "shield-half-outline" : "cube-outline"} 
                      size={20} 
                      color={selectedType === t ? "#FFF" : colors.textSub} 
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={[styles.helperText, { color: colors.textSub }]}>{getTypeLabel(selectedType)}</Text>
            </View>

            <View style={{ width: 120 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>DÉCISION</Text>
              <View style={[styles.actionSwitch, { backgroundColor: colors.bgMain, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.actionBtn, selectedAction === "CONFISCATE" && { backgroundColor: JUDGE_ACCENT }]}
                  onPress={() => setSelectedAction("CONFISCATE")}
                >
                  <Text style={[styles.actionText, { color: selectedAction === "CONFISCATE" ? "#FFF" : colors.textSub }]}>État</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, selectedAction === "DESTROY" && { backgroundColor: "#EF4444" }]}
                  onPress={() => setSelectedAction("DESTROY")}
                >
                  <Text style={[styles.actionText, { color: selectedAction === "DESTROY" ? "#FFF" : colors.textSub }]}>Destr.</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.addBtn, { borderColor: JUDGE_ACCENT }]} 
            onPress={handleAddItem}
          >
            <Ionicons name="add-circle" size={22} color={JUDGE_ACCENT} />
            <Text style={[styles.addBtnText, { color: JUDGE_ACCENT }]}>INSCRIRE À L'ORDONNANCE</Text>
          </TouchableOpacity>
        </View>

        {/* 📋 LISTE DES BIENS STATUÉS */}
        <Text style={[styles.listHeader, { color: colors.textMain }]}>
          Biens inscrits ({items.length})
        </Text>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={50} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucun bien désigné pour le moment.</Text>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.bgCard, borderColor: item.action === "DESTROY" ? "#EF4444" : JUDGE_ACCENT }]}>
              <View style={[styles.iconBox, { backgroundColor: item.action === "CONFISCATE" ? JUDGE_ACCENT + "15" : "#FEE2E2" }]}>
                 <Ionicons 
                   name={item.action === "CONFISCATE" ? "business" : "trash-bin"} 
                   size={22} 
                   color={item.action === "CONFISCATE" ? JUDGE_ACCENT : "#EF4444"} 
                 />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemDesc, { color: colors.textMain }]}>{item.description.toUpperCase()}</Text>
                <Text style={[styles.itemSub, { color: colors.textSub }]}>
                  {getTypeLabel(item.type)} • <Text style={{fontWeight: '900', color: item.action === "CONFISCATE" ? JUDGE_ACCENT : "#EF4444"}}>
                    {item.action === "CONFISCATE" ? "ACQUISITION ÉTAT" : "DESTRUCTION"}
                  </Text>
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                <Ionicons name="close-circle" size={26} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* 🔏 VALIDATION FINALE */}
        {items.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.finalBtn, { backgroundColor: JUDGE_ACCENT }]}
            onPress={handleFinalizeConfiscation}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Ionicons name="ribbon-outline" size={24} color="#FFF" />
                <Text style={styles.finalBtnText}>SCELLER L'ORDONNANCE</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  infoBox: { padding: 20, borderRadius: 20, marginBottom: 25, borderLeftWidth: 8, borderWidth: 1, elevation: 2 },
  infoText: { fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
  infoSub: { fontSize: 12, marginTop: 5, fontWeight: '700', textTransform: 'uppercase', opacity: 0.8 },
  formCard: { padding: 22, borderRadius: 26, borderWidth: 1, marginBottom: 35, elevation: 4, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  sectionTitle: { fontSize: 10, fontWeight: "900", marginBottom: 15, letterSpacing: 1.5, textTransform: 'uppercase' },
  input: { padding: 18, borderRadius: 16, borderWidth: 1.5, marginBottom: 20, fontSize: 15, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 15 },
  label: { fontSize: 10, fontWeight: "900", marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6 },
  chipsRow: { flexDirection: "row", marginBottom: 10 },
  chip: { width: 46, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 10, borderWidth: 1.5 },
  helperText: { fontSize: 11, fontWeight: "800", fontStyle: 'italic' },
  actionSwitch: { flexDirection: "row", borderRadius: 14, padding: 4, flex: 1, height: 48, borderWidth: 1 },
  actionBtn: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  actionText: { fontSize: 11, fontWeight: "900" },
  addBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 25, padding: 18, borderRadius: 18, borderWidth: 2, borderStyle: "dashed" },
  addBtnText: { marginLeft: 10, fontWeight: "900", fontSize: 13, letterSpacing: 0.5 },
  listHeader: { fontSize: 19, fontWeight: "900", marginBottom: 20, letterSpacing: -0.5 },
  emptyState: { alignItems: 'center', marginTop: 40, opacity: 0.6 },
  emptyText: { fontWeight: "800", textAlign: "center", marginTop: 15, fontSize: 14 },
  itemCard: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 22, marginBottom: 16, borderLeftWidth: 10, borderWidth: 1, elevation: 3 },
  iconBox: { width: 50, height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 15 },
  itemDesc: { fontSize: 15, fontWeight: "900", letterSpacing: -0.3 },
  itemSub: { fontSize: 12, marginTop: 4, fontWeight: '700' },
  finalBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", height: 68, borderRadius: 22, marginTop: 30, gap: 12, elevation: 6, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10 },
  finalBtnText: { color: "#FFF", fontSize: 15, fontWeight: "900", letterSpacing: 1 },
});