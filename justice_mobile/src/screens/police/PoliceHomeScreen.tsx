import React, { useState, useMemo, useEffect } from "react";
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  RefreshControl, StatusBar, ActivityIndicator, Platform, 
  TextInput, ScrollView 
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture & Store
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { PoliceScreenProps } from "../../types/navigation";

// ✅ UI
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Services
import { getAllComplaints, Complaint } from "../../services/complaint.service";

export default function PoliceHomeScreen({ navigation }: PoliceScreenProps<'PoliceHome'>) {
  const { theme, isDark } = useAppTheme();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date()); // ✅ État pour l'horloge
  const primaryColor = theme.colors.primary;

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
  };

  // ✅ LOGIQUE DE L'HORLOGE TEMPS RÉEL
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

  // 📡 Récupération des données
  const { data: complaints, isLoading, refetch } = useQuery({
    queryKey: ["all-complaints"],
    queryFn: getAllComplaints,
  });

  // 🔍 Filtrage dynamique
  const filteredComplaints = useMemo(() => {
    if (!complaints) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return complaints.filter((c: Complaint) => 
      c.title?.toLowerCase().includes(lowerQuery) ||
      c.description?.toLowerCase().includes(lowerQuery) ||
      c.id.toString().includes(lowerQuery) ||
      c.citizen?.firstname?.toLowerCase().includes(lowerQuery) ||
      c.citizen?.lastname?.toLowerCase().includes(lowerQuery)
    );
  }, [complaints, searchQuery]);

  // 🛠️ ACTIONS RAPIDES OPJ
  const QuickActions = () => (
    <View style={styles.quickActionsGrid}>
      <TouchableOpacity style={[styles.actionItem, { backgroundColor: colors.bgCard }]} onPress={() => navigation.navigate("PolicePVScreen", {})}>
        <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}><Ionicons name="document-text" size={24} color="#2563EB" /></View>
        <Text style={[styles.actionLabel, { color: colors.textMain }]}>Nouveau PV</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionItem, { backgroundColor: colors.bgCard }]} onPress={() => navigation.navigate("PoliceCustody", { complaintId: 0, suspectName: "" })}>
        <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}><Ionicons name="lock-closed" size={24} color="#DC2626" /></View>
        <Text style={[styles.actionLabel, { color: colors.textMain }]}>Garde à vue</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionItem, { backgroundColor: colors.bgCard }]} onPress={() => navigation.navigate("WarrantSearch")}>
        <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}><Ionicons name="search" size={24} color="#D97706" /></View>
        <Text style={[styles.actionLabel, { color: colors.textMain }]}>Rechercher</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionItem, { backgroundColor: colors.bgCard }]} onPress={() => navigation.navigate("NationalMap" as any)}>
        <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}><Ionicons name="map" size={24} color="#059669" /></View>
        <Text style={[styles.actionLabel, { color: colors.textMain }]}>Carte/SOS</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: Complaint }) => {
    const citizenName = item.citizen ? `${item.citizen.firstname} ${item.citizen.lastname}` : "Citoyen anonyme";
    
    return (
      <TouchableOpacity 
        style={[styles.complaintCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
        onPress={() => navigation.navigate("PoliceComplaintDetails", { complaintId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.rgNumber, { color: primaryColor }]}>RG #{item.id}</Text>
          <View style={[styles.badge, { backgroundColor: item.status === 'soumise' ? '#FFEDD5' : '#E0F2FE' }]}>
            <Text style={[styles.badgeText, { color: item.status === 'soumise' ? '#9A3412' : '#0369A1' }]}>
              {item.status.replace(/_/g, ' ').toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.cardTitle, { color: colors.textMain }]} numberOfLines={1}>
            {item.title || "Plainte sans titre"}
        </Text>
        
        <View style={styles.citizenRow}>
            <Ionicons name="person-circle-outline" size={16} color={primaryColor} />
            <Text style={[styles.citizenName, { color: colors.textMain }]}>{citizenName}</Text>
        </View>

        <Text style={[styles.cardDesc, { color: colors.textSub }]} numberOfLines={2}>
            {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <Ionicons name="time-outline" size={14} color={colors.textSub} />
          <Text style={[styles.cardDate, { color: colors.textSub }]}>
            {new Date(item.filedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Tableau de Bord OPJ" showSos={true} showMenu={true} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.bgMain }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {/* 1. RÉSUMÉ STATS & HORLOGE */}
        <View style={styles.headerStats}>
          <View style={[styles.clockBox, { backgroundColor: colors.bgCard }]}>
            <Text style={[styles.clockTime, { color: primaryColor }]}>{timeString}</Text>
            <Text style={[styles.clockDate, { color: colors.textSub }]}>{dateString}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statVal}>{complaints?.length || 0}</Text>
            <Text style={styles.statLab}>Dossiers</Text>
          </View>

          <TouchableOpacity style={styles.qrButton} onPress={() => alert("Ouverture du Scanner...")}>
            <Ionicons name="qr-code-outline" size={24} color="#FFF" />
            <Text style={styles.qrText}>SCANNER</Text>
          </TouchableOpacity>
        </View>

        {/* 2. RECHERCHE */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSub} />
            <TextInput 
              placeholder="Nom, RG, mot-clé..." 
              placeholderTextColor={colors.textSub}
              style={[styles.searchInput, { color: colors.textMain }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color={colors.textSub} />
                </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 3. ACTIONS RAPIDES */}
        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Actions Prioritaires</Text>
        <QuickActions />

        {/* 4. LISTE FILTRÉE */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textMain }]}>
              {searchQuery ? "Résultats" : "Dernières Plaintes"}
          </Text>
          {!searchQuery && (
            <TouchableOpacity onPress={() => navigation.navigate("PoliceComplaints" as any)}>
                <Text style={{ color: primaryColor, fontWeight: '700', marginRight: 20 }}>Voir tout</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} color={primaryColor} />
        ) : (
          <FlatList
            data={filteredComplaints.slice(0, 10)}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false} 
            contentContainerStyle={styles.list}
            ListEmptyComponent={
                <Text style={styles.emptyText}>
                    {searchQuery ? "Aucun résultat trouvé" : "Aucun dossier récent"}
                </Text>
            }
          />
        )}
        <View style={{ height: 100 }} /> 
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerStats: { flexDirection: 'row', padding: 20, alignItems: 'center', gap: 10 },
  clockBox: { flex: 1.5, padding: 12, borderRadius: 15, alignItems: 'center', elevation: 2, shadowOpacity: 0.05 },
  clockTime: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  clockDate: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  
  statBox: { flex: 1, backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: 12, borderRadius: 15, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '900', color: '#2563EB' },
  statLab: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },

  qrButton: { backgroundColor: '#1E293B', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  qrText: { color: '#FFF', fontSize: 8, fontWeight: '900', marginTop: 4 },
  
  searchContainer: { paddingHorizontal: 20, paddingVertical: 5 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 45, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 10, fontWeight: '600', fontSize: 14 },

  sectionTitle: { fontSize: 17, fontWeight: '900', marginHorizontal: 20, marginTop: 20, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, gap: 10 },
  actionItem: { width: '48%', padding: 15, borderRadius: 16, alignItems: 'center', elevation: 2, shadowOpacity: 0.05 },
  actionIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 12, fontWeight: '800' },

  list: { paddingHorizontal: 20 },
  complaintCard: { padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rgNumber: { fontWeight: '900', fontSize: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '900' },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  citizenRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  citizenName: { fontSize: 13, fontWeight: '700', opacity: 0.9 },
  cardDesc: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardDate: { fontSize: 11, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 40, opacity: 0.5, fontWeight: '700' }
});