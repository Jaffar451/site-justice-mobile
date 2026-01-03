import React, { useEffect, useState, useMemo } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Linking, 
  Platform, 
  ActivityIndicator,
  StatusBar,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture & Navigation
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Services (Utilisation du service réel créé au début)
import { getAllStations, PoliceStation } from "../../services/policeStation.service";

export default function PoliceStationScreen() {
  const { user } = useAuthStore();
  const { isDark } = useAppTheme();
  
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Détermination de la couleur institutionnelle (Police vs Justice)
  const brandColor = useMemo(() => {
    const role = (user?.role || "citizen").toLowerCase();
    if (["police", "commissaire", "opj"].includes(role)) return "#1E3A8A";
    if (["judge", "prosecutor", "clerk", "admin"].includes(role)) return "#7C2D12";
    return "#0891B2";
  }, [user?.role]);

  const canSeeStats = ['police', 'opj', 'prosecutor', 'judge', 'admin', 'commissaire'].includes(user?.role || '');

  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await getAllStations();
      setStations(data);
    } catch (e) {
      console.error("Erreur chargement unités:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openMap = (lat: number | null, lng: number | null, name: string) => {
    if (!lat || !lng) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${name}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${name})`,
      web: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    });
    if (url) Linking.openURL(url);
  };

  const renderItem = ({ item }: { item: PoliceStation }) => {
    // Simulation des KPI si non fournis par l'API
    const total = 100; // Mock pour l'UI
    const resolved = 75; // Mock pour l'UI
    const resolutionRate = 75;

    return (
      <View style={[styles.card, { backgroundColor: isDark ? "#1A1A1A" : "#FFF", borderColor: isDark ? "#333" : "#F1F5F9" }]}>
        <View style={styles.cardHeader}>
          <View style={styles.headerInfo}>
            <Text style={[styles.stationName, { color: isDark ? "#FFF" : "#1E293B" }]}>{item.name}</Text>
            <View style={styles.districtRow}>
              <Ionicons name="business-outline" size={14} color={brandColor} />
              <Text style={styles.districtText}>{item.district.toUpperCase()} - {item.city}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => openMap(item.latitude, item.longitude, item.name)} 
            style={[styles.mapBtn, { backgroundColor: brandColor }]}
          >
            <Ionicons name="navigate" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {canSeeStats && (
          <View style={styles.statsContainer}>
            <View style={[styles.divider, { backgroundColor: isDark ? "#333" : "#F1F5F9" }]} />
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>PROCÉDURES</Text>
                <Text style={[styles.statValue, { color: isDark ? "#FFF" : "#1E293B" }]}>{total}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>DÉFÉRÉES</Text>
                <Text style={[styles.statValue, { color: "#10B981" }]}>{resolved}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>EFFICACITÉ</Text>
                <Text style={[styles.statValue, { color: brandColor }]}>{resolutionRate}%</Text>
              </View>
            </View>
            
            <View style={[styles.progressBarBg, { backgroundColor: isDark ? "#333" : "#F1F5F9" }]}>
               <View style={[styles.progressBarFill, { width: `${resolutionRate}%`, backgroundColor: brandColor }]} />
            </View>
          </View>
        )}

        {item.phone && (
          <TouchableOpacity 
            style={[styles.contactRow, { borderTopColor: isDark ? "#333" : "#F8FAFC" }]} 
            onPress={() => Linking.openURL(`tel:${item.phone}`)}
          >
              <Ionicons name="call" size={16} color="#64748B" />
              <Text style={[styles.phoneText, { color: isDark ? "#CBD5E1" : "#1E293B" }]}>{item.phone}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Unités de Police" showMenu={true} />
      
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={brandColor} />
            <Text style={styles.loaderText}>Liaison avec le registre central...</Text>
        </View>
      ) : (
        <FlatList
          data={stations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brandColor} />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
                <Text style={[styles.listIntro, { color: isDark ? "#94A3B8" : "#64748B" }]}>
                {canSeeStats 
                    ? "Suivi opérationnel des Commissariats et Brigades de Gendarmerie nationale." 
                    : "Annuaire officiel des unités de police pour l'assistance et le dépôt de plainte."}
                </Text>
                <View style={[styles.indicator, { backgroundColor: brandColor + "40" }]} />
            </View>
          }
        />
      )}

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 15, fontWeight: 'bold', fontSize: 12, color: "#64748B", letterSpacing: 0.5 },
  listPadding: { paddingHorizontal: 16, paddingTop: 15, paddingBottom: 150 },
  listHeader: { marginBottom: 20, paddingHorizontal: 4 },
  listIntro: { fontSize: 13, fontWeight: '600', lineHeight: 20 },
  indicator: { width: 40, height: 4, borderRadius: 2, marginTop: 10 },
  
  card: { 
    padding: 20, borderRadius: 24, marginBottom: 15, 
    borderWidth: 1, elevation: 3,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerInfo: { flex: 1 },
  stationName: { fontSize: 17, fontWeight: 'bold', letterSpacing: -0.4 },
  districtRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 5 },
  districtText: { fontSize: 11, fontWeight: '700', color: "#94A3B8" },
  
  mapBtn: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  
  statsContainer: { marginTop: 15 },
  divider: { height: 1, marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 8, fontWeight: 'bold', color: '#94A3B8', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  
  progressBarBg: { height: 6, borderRadius: 3, marginTop: 12, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },

  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 15, paddingTop: 12, borderTopWidth: 1 },
  phoneText: { fontSize: 14, fontWeight: '600' }
});