import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Architecture & Thème
import { useAppTheme } from "../../theme/AppThemeProvider"; // Hook dynamique
import { PoliceScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Types pour le registre des GAV
interface GAVEntry {
  id: string;
  name: string;
  startTime: Date;
  offence: string;
  unit: string;
  status: "ACTIVE" | "EXTENDED" | "RELEASED";
}

export default function CommissaireGAVSupervisionScreen({ navigation }: PoliceScreenProps<'CommissaireGAVSupervision'>) {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    track: isDark ? "#0F172A" : "#F1F5F9",
  };
  
  // Mock data : Registre des personnes en cellule
  const [entries] = useState<GAVEntry[]>([
    { 
      id: "GAV-991", 
      name: "Abdoulaye K. SEYNI", 
      startTime: new Date(Date.now() - 38 * 60 * 60 * 1000), // 38h écoulées
      offence: "Vol qualifié",
      unit: "Commissariat Central - BR",
      status: "ACTIVE"
    },
    { 
      id: "GAV-995", 
      name: "Moussa B. HAROUNA", 
      startTime: new Date(Date.now() - 46.5 * 60 * 60 * 1000), // 46.5h écoulées (Critique)
      offence: "Escroquerie",
      unit: "Commissariat 2ème Arrondissement",
      status: "ACTIVE"
    },
    { 
      id: "GAV-998", 
      name: "Fati Z. BOUBACAR", 
      startTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12h écoulées
      offence: "Abus de confiance",
      unit: "BPM (Protection Mineurs)",
      status: "ACTIVE"
    }
  ]);

  const calculateTimeLeft = (startTime: Date) => {
    const elapsed = (Date.now() - startTime.getTime()) / (1000 * 60 * 60);
    const remaining = 48 - elapsed;
    return {
      hoursElapsed: Math.floor(elapsed),
      hoursRemaining: Math.max(0, Math.floor(remaining)),
      isCritical: remaining < 6,
      isWarning: remaining >= 6 && remaining < 18,
      progress: Math.min(1, elapsed / 48)
    };
  };

  const getStatusColor = (time: any) => {
    if (time.isCritical) return "#EF4444";
    if (time.isWarning) return "#F59E0B";
    return "#10B981";
  };

  const renderGAVCard = ({ item }: { item: GAVEntry }) => {
    const time = calculateTimeLeft(item.startTime);
    const accentColor = getStatusColor(time);

    return (
      <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.personInfo}>
            <Text style={[styles.name, { color: colors.textMain }]}>{item.name}</Text>
            <Text style={[styles.unit, { color: colors.textSub }]}>{item.unit}</Text>
          </View>
          <View style={[styles.timerBadge, { backgroundColor: accentColor + "20" }]}>
            <Ionicons name="time-outline" size={14} color={accentColor} />
            <Text style={[styles.timerText, { color: accentColor }]}>{time.hoursRemaining}h restants</Text>
          </View>
        </View>

        {/* Barre de progression du délai légal */}
        <View style={[styles.progressTrack, { backgroundColor: colors.track }]}>
            <View style={[styles.progressBar, { width: `${time.progress * 100}%`, backgroundColor: accentColor }]} />
        </View>

        <View style={styles.detailsRow}>
          <Text style={[styles.offenceLabel, { color: colors.textSub }]}>
            Motif : <Text style={{ color: colors.textMain, fontWeight: '700' }}>{item.offence}</Text>
          </Text>
          
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => Alert.alert("Prolongation Judiciaire", "Souhaitez-vous viser la demande de prolongation de 48h pour transmission au Parquet ?")}
            style={[styles.extendBtn, { borderColor: primaryColor }]}
          >
            <Text style={[styles.extendText, { color: primaryColor }]}>VISER PROLONGATION</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Supervision Garde à Vue" showBack />

      <View style={[styles.mainWrapper, { backgroundColor: colors.bgMain }]}>
        
        {/* Résumé Statistique */}
        <View style={[styles.statsBanner, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.textMain }]}>{entries.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSub }]}>En cellule</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: "#EF4444" }]}>
                {entries.filter(e => calculateTimeLeft(e.startTime).isCritical).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSub }]}>Alertes 6h</Text>
          </View>
        </View>

        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderGAVCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Registres des GAV actives (Délai 48h)</Text>
          }
        />
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 140 },
  sectionTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginBottom: 20, textTransform: 'uppercase' },
  
  statsBanner: { flexDirection: 'row', padding: 20, margin: 16, borderRadius: 24, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 }, android: { elevation: 4 } }) },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 26, fontWeight: "900" },
  statLabel: { fontSize: 10, fontWeight: "800", marginTop: 4, textTransform: 'uppercase' },
  divider: { width: 1, height: 40 },

  card: { 
    padding: 20, borderRadius: 28, marginBottom: 16, borderWidth: 1, 
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 }
    })
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  personInfo: { flex: 1, marginRight: 10 },
  name: { fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
  unit: { fontSize: 11, fontWeight: "700", marginTop: 4 },
  
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  timerText: { fontSize: 11, fontWeight: "900" },

  progressTrack: { height: 8, borderRadius: 4, marginBottom: 20, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },

  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  offenceLabel: { fontSize: 12, fontWeight: "600" },
  extendBtn: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  extendText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 }
});