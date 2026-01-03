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

// ✅ 1. Imports Architecture
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { JudgeScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { updateDecision } from "../../services/decision.service"; 

type AssetType = "MONEY" | "VEHICLE" | "WEAPON" | "DRUGS" | "OTHER";

interface ConfiscatedItem {
  id: string;
  description: string;
  type: AssetType;
  action: "CONFISCATE" | "DESTROY";
}

export default function JudgeConfiscationScreen({ route, navigation }: JudgeScreenProps<'JudgeConfiscation'>) {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  
  const params = route.params as any;
  const { caseId, decisionId } = params || { caseId: "N/A", decisionId: null };

  const [itemDesc, setItemDesc] = useState("");
  const [selectedType, setSelectedType] = useState<AssetType>("OTHER");
  const [selectedAction, setSelectedAction] = useState<"CONFISCATE" | "DESTROY">("CONFISCATE");

  const [items, setItems] = useState<ConfiscatedItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    formBg: isDark ? "#1E293B" : "#F8FAFC",
  };

  const handleAddItem = () => {
    if (!itemDesc.trim()) {
      const msg = "Veuillez décrire le bien saisi.";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Champ requis", msg);
      return;
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

  const handleFinalizeConfiscation = async () => {
    if (items.length === 0) {
      Alert.alert("Liste vide", "Précisez au moins un bien pour valider l'ordonnance.");
      return;
    }

    const title = "Signer l'Ordonnance";
    const msg = `Vous allez statuer sur ${items.length} scellé(s). Confirmer ?`;

    if (Platform.OS === 'web') {
        const confirm = window.confirm(`${title} : ${msg}`);
        if (confirm) executeFinalize();
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
      const payload = {
        confiscations: items,
        confiscationDate: new Date().toISOString(),
        judgeSignature: `SIG-${user?.id}-${Date.now()}`,
      };
      await updateDecision(decisionId, payload as any);
      
      if (Platform.OS === 'web') window.alert("✅ Ordonnance signée numériquement.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erreur", "Échec de l'enregistrement de l'ordonnance.");
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: AssetType) => {
    const labels = {
      MONEY: "Numéraire / Valeurs",
      VEHICLE: "Véhicule / Engin",
      WEAPON: "Arme / Munitions",
      DRUGS: "Produits Stupéfiants",
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
        
        {/* 🏛️ RÉFÉRENCE JURIDIQUE */}
        <View style={[styles.infoBox, { borderLeftColor: primaryColor }]}>
          <Text style={[styles.infoText, { color: colors.textMain }]}>
            Information Judiciaire : RG #{caseId}
          </Text>
          <Text style={[styles.infoSub, { color: colors.textSub }]}>
            Magistrat Signataire : Juge {user?.lastname}
          </Text>
        </View>

        {/* 📝 FORMULAIRE D'AJOUT */}
        <View style={[styles.formCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: primaryColor }]}>DÉTAILS DU SCELLÉ</Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textMain }]}
            placeholder="Désignation (ex: véhicule immatriculé...)"
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            value={itemDesc}
            onChangeText={setItemDesc}
          />

          <View style={styles.row}>
            <View style={{ flex: 1.2 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>CATÉGORIE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                {(["MONEY", "VEHICLE", "WEAPON", "DRUGS", "OTHER"] as AssetType[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                        styles.chip, 
                        { backgroundColor: selectedType === t ? primaryColor : colors.border }
                    ]}
                    onPress={() => setSelectedType(t)}
                  >
                    <Ionicons 
                      name={t === "MONEY" ? "cash" : t === "VEHICLE" ? "car" : t === "WEAPON" ? "shield" : "cube"} 
                      size={18} 
                      color={selectedType === t ? "#FFF" : colors.textSub} 
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={[styles.helperText, { color: colors.textSub }]}>{getTypeLabel(selectedType)}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSub }]}>DÉCISION</Text>
              <View style={[styles.actionSwitch, { backgroundColor: isDark ? "#0F172A" : "#E2E8F0" }]}>
                <TouchableOpacity
                  style={[styles.actionBtn, selectedAction === "CONFISCATE" && { backgroundColor: primaryColor }]}
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
            style={[styles.addBtn, { borderColor: primaryColor }]} 
            onPress={handleAddItem}
          >
            <Ionicons name="add-circle" size={20} color={primaryColor} />
            <Text style={[styles.addBtnText, { color: primaryColor }]}>Ajouter à l'acte</Text>
          </TouchableOpacity>
        </View>

        {/* 📋 LISTE DES BIENS */}
        <Text style={[styles.listHeader, { color: colors.textMain }]}>
          Biens inscrits à l'Ordonnance ({items.length})
        </Text>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucun scellé désigné.</Text>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.bgCard, borderColor: item.action === "DESTROY" ? "#EF4444" : primaryColor }]}>
              <View style={[styles.iconBox, { backgroundColor: item.action === "CONFISCATE" ? primaryColor + "15" : "#450A0A" }]}>
                 <Ionicons 
                   name={item.action === "CONFISCATE" ? "business" : "trash-bin"} 
                   size={20} 
                   color={item.action === "CONFISCATE" ? primaryColor : "#EF4444"} 
                 />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemDesc, { color: colors.textMain }]}>{item.description}</Text>
                <Text style={[styles.itemSub, { color: colors.textSub }]}>
                  {getTypeLabel(item.type)} • <Text style={{fontWeight: '900', color: item.action === "CONFISCATE" ? primaryColor : "#EF4444"}}>
                    {item.action === "CONFISCATE" ? "ACQUISITION ÉTAT" : "DESTRUCTION"}
                  </Text>
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* 🔏 BOUTON DE SIGNATURE */}
        {items.length > 0 && (
          <TouchableOpacity
            style={[styles.finalBtn, { backgroundColor: primaryColor }]}
            onPress={handleFinalizeConfiscation}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Ionicons name="shield-checkmark" size={22} color="#FFF" />
                <Text style={styles.finalBtnText}>Signer l'Ordonnance</Text>
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
  container: { padding: 16 },
  infoBox: { marginBottom: 20, borderLeftWidth: 4, paddingLeft: 12, paddingVertical: 4 },
  infoText: { fontSize: 16, fontWeight: "900" },
  infoSub: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  
  formCard: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 30, elevation: 2 },
  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 15, letterSpacing: 1.2, textTransform: 'uppercase' },
  input: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 20, fontSize: 14, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  label: { fontSize: 10, fontWeight: "900", marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  chipsRow: { flexDirection: "row", marginBottom: 8 },
  chip: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 8 },
  helperText: { fontSize: 11, fontWeight: "700", marginTop: 4 },
  actionSwitch: { flexDirection: "row", borderRadius: 12, padding: 4, flex: 1, height: 46 },
  actionBtn: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  actionText: { fontSize: 12, fontWeight: "900" },
  addBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20, padding: 16, borderRadius: 16, borderWidth: 2, borderStyle: "dashed" },
  addBtnText: { marginLeft: 10, fontWeight: "900", fontSize: 14 },
  
  listHeader: { fontSize: 18, fontWeight: "900", marginBottom: 20 },
  emptyState: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyText: { fontWeight: "700", textAlign: "center", marginTop: 12 },
  
  itemCard: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 14, 
    borderLeftWidth: 8,
    ...Platform.select({
        android: { elevation: 3 },
        ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5 },
        web: { boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" }
    })
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 15 },
  itemDesc: { fontSize: 15, fontWeight: "900" },
  itemSub: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  
  finalBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 22, borderRadius: 20, marginTop: 25, gap: 12, elevation: 6 },
  finalBtnText: { color: "#FFF", fontSize: 17, fontWeight: "900", letterSpacing: 0.5 },
});