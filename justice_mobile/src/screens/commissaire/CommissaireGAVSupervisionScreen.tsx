import React, { useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

// ✅ 1. Architecture & Services
import { useAppTheme } from "../../theme/AppThemeProvider";
import { PoliceScreenProps } from "../../types/navigation";
import api from "../../services/api"; // Assurez-vous que ce fichier existe

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ 2. Typage des données Backend
// Adaptez ces champs selon votre modèle Prisma/Backend réel
interface ApiCustodyData {
  id: number;
  suspectName: string; // ou suspect_name
  custodyStartTime: string; // Format ISO venant du backend
  offenseType: string;
  policeStation: { name: string };
  status: "active" | "extended" | "released";
}

// Typage pour l'UI (transformé)
interface GAVEntry {
  id: string;
  name: string;
  startTime: Date;
  offence: string;
  unit: string;
  status: string;
}

// ✅ 3. Fonction de récupération (Service)
const fetchActiveCustodies = async (): Promise<ApiCustodyData[]> => {
  // Remplacez '/custodies/active' par votre vrai endpoint (ex: '/complaints?status=gav')
  const { data } = await api.get("/custodies/active"); 
  return data;
};

export default function CommissaireGAVSupervisionScreen({ navigation }: PoliceScreenProps<'CommissaireGAVSupervision'>) {
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

  // ✅ 4. Récupération des données avec React Query
  const { data: rawData, isLoading, refetch, isRefetching, isError } = useQuery({
    queryKey: ['active-custodies'],
    queryFn: fetchActiveCustodies,
    refetchInterval: 60000, // Rafraîchissement auto toutes les minutes (critique pour GAV)
  });

  // ✅ 5. Transformation et Sécurisation des données
  const entries: GAVEntry[] = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return [];

    return rawData.map((item) => ({
      id: item.id.toString(),
      name: item.suspectName || "Inconnu",
      startTime: new Date(item.custodyStartTime), // Conversion ISO String -> Date Object
      offence: item.offenseType || "Infraction non spécifiée",
      unit: item.policeStation?.name || "Unité indéterminée",
      status: item.status.toUpperCase()
    }));
  }, [rawData]);

  // --- LOGIQUE MÉTIER (Calculs Délais) ---

  const calculateTimeLeft = (startTime: Date) => {
    // Sécurité si la date est invalide
    if (isNaN(startTime.getTime())) return { hoursRemaining: 0, isCritical: false, progress: 1 };

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

  // --- RENDERERS ---

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
            <Text style={[styles.timerText, { color: accentColor }]}>
                {time.hoursRemaining}h restants
            </Text>
          </View>
        </View>

        {/* Barre de progression */}
        <View style={[styles.progressTrack, { backgroundColor: colors.track }]}>
            <View style={[styles.progressBar, { width: `${time.progress * 100}%`, backgroundColor: accentColor }]} />
        </View>

        <View style={styles.detailsRow}>
          <Text style={[styles.offenceLabel, { color: colors.textSub }]}>
            Motif : <Text style={{ color: colors.textMain, fontWeight: '700' }}>{item.offence}</Text>
          </Text>
          
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => Alert.alert("Action Requise", `Traiter la prolongation pour le dossier #${item.id} ?`)}
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
        
        {/* Résumé Statistique (Calculé sur les vraies données) */}
        <View style={[styles.statsBanner, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            {isLoading ? <ActivityIndicator size="small" color={colors.textMain} /> : (
                <Text style={[styles.statNum, { color: colors.textMain }]}>{entries.length}</Text>
            )}
            <Text style={[styles.statLabel, { color: colors.textSub }]}>En cellule</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            {isLoading ? <ActivityIndicator size="small" color="#EF4444" /> : (
                <Text style={[styles.statNum, { color: "#EF4444" }]}>
                    {entries.filter(e => calculateTimeLeft(e.startTime).isCritical).length}
                </Text>
            )}
            <Text style={[styles.statLabel, { color: colors.textSub }]}>Alertes 6h</Text>
          </View>
        </View>

        {isLoading && !isRefetching ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={{ marginTop: 10, color: colors.textSub }}>Chargement des GAV...</Text>
            </View>
        ) : (
            <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={renderGAVCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={primaryColor} />
            }
            ListHeaderComponent={
                <Text style={[styles.sectionTitle, { color: colors.textSub }]}>
                    Registre temps réel (Délai 48h)
                </Text>
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="checkmark-circle-outline" size={60} color={colors.textSub} style={{opacity: 0.5}} />
                    <Text style={{ color: colors.textSub, marginTop: 10 }}>Aucune garde à vue en cours.</Text>
                </View>
            }
            />
        )}
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  extendText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  
  emptyContainer: { alignItems: 'center', marginTop: 50 }
});