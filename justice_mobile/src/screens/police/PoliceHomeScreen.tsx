import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  RefreshControl, StatusBar, ActivityIndicator, Platform, 
  TextInput, ScrollView 
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// ✅ Architecture & Store
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { PoliceScreenProps } from "../../types/navigation";

// ✅ UI
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// ✅ Services
import { getAllComplaints } from "../../services/complaint.service";
import { getPoliceStats } from "../../services/stats.service"; // ✅ Import des stats réelles

export default function PoliceHomeScreen({ navigation }: PoliceScreenProps<'PoliceHome'>) {
  const { theme, isDark } = useAppTheme();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date()); 
  const primaryColor = "#1E3A8A"; // 🔵 Bleu Police/Gendarmerie

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#F1F5F9",
  };

  // ✅ HORLOGE TEMPS RÉEL
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

  // 📡 Récupération des dossiers
  const { data: complaints, isLoading: loadingCases, refetch: refetchCases } = useQuery({
    queryKey: ["all-complaints"],
    queryFn: getAllComplaints,
  });

  // 📡 Récupération des stats réelles (Urgences, GAV, etc.)
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    queryKey: ["police-global-stats"],
    queryFn: getPoliceStats,
  });

  useFocusEffect(
    useCallback(() => {
      refetchCases();
      refetchStats();
    }, [refetchCases, refetchStats])
  );

  // 🔍 Filtrage sécurisé
  const filteredComplaints = useMemo(() => {
    if (!complaints || !Array.isArray(complaints)) return [];
    const lowerQuery = searchQuery.toLowerCase();
    
    return complaints.filter((c: any) => {
      const title = c.title?.toLowerCase() || "";
      const id = c.id?.toString() || "";
      const citizen = (c.complainant || c.citizen)?.lastname?.toLowerCase() || "";

      return title.includes(lowerQuery) || id.includes(lowerQuery) || citizen.includes(lowerQuery);
    });
  }, [complaints, searchQuery]);

  const renderComplaint = ({ item }: { item: any }) => {
    const person = item.complainant || item.citizen;
    const isUrgent = item.isUrgent || item.priority === 'high';
    
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        style={[styles.complaintCard, { backgroundColor: colors.bgCard, borderColor: isUrgent ? '#EF4444' : colors.border }]}
        onPress={() => navigation.navigate("PoliceComplaintDetails", { complaintId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.rgNumber, { color: primaryColor }]}>PV #{item.id}</Text>
          <View style={[styles.badge, { backgroundColor: isUrgent ? '#FEE2E2' : '#E0F2FE' }]}>
            <Text style={[styles.badgeText, { color: isUrgent ? '#B91C1C' : '#0369A1' }]}>
              {item.status?.replace(/_/g, ' ').toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.cardTitle, { color: colors.textMain }]} numberOfLines={1}>{item.title}</Text>
        
        <View style={styles.citizenRow}>
            <Ionicons name="person-outline" size={14} color={colors.textSub} />
            <Text style={[styles.citizenName, { color: colors.textSub }]}>
                {person ? `${person.firstname} ${person.lastname}` : "Source Anonyme"}
            </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerInfo}>
             <Ionicons name="calendar-outline" size={12} color={colors.textSub} />
             <Text style={[styles.cardDate, { color: colors.textSub }]}>
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : '--'}
             </Text>
          </View>
          {isUrgent && <Ionicons name="alert-circle" size={18} color="#EF4444" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Poste de Commandement" showSos={true} showMenu={true} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.bgMain }}
        refreshControl={<RefreshControl refreshing={loadingCases || loadingStats} onRefresh={() => { refetchCases(); refetchStats(); }} tintColor={primaryColor} />}
      >
        {/* 🕒 HEADER STATS & HORLOGE */}
        <View style={styles.headerStats}>
          <View style={[styles.clockBox, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.clockTime, { color: primaryColor }]}>{timeString}</Text>
            <Text style={[styles.clockDate, { color: colors.textSub }]}>{dateString.toUpperCase()}</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: isDark ? "#1E293B" : "#DBEAFE" }]}>
            <Text style={[styles.statVal, { color: primaryColor }]}>{stats?.total || 0}</Text>
            <Text style={[styles.statLab, { color: primaryColor }]}>Dossiers</Text>
          </View>

          <TouchableOpacity style={styles.qrButton} onPress={() => alert("Scanner d'actes judiciaires...")}>
            <Ionicons name="qr-code-outline" size={24} color="#FFF" />
            <Text style={styles.qrText}>SCANNER</Text>
          </TouchableOpacity>
        </View>

        {/* 🔍 BARRE DE RECHERCHE */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSub} />
            <TextInput 
              placeholder="Rechercher un PV, un nom..." 
              placeholderTextColor={colors.textSub}
              style={[styles.searchInput, { color: colors.textMain }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* 🛠️ ACTIONS RAPIDES OPJ */}
        <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Actions OPJ</Text>
        <View style={styles.quickActionsGrid}>
          <ActionBtn label="Nouveau PV" icon="document-text" color="#2563EB" bg="#DBEAFE" onPress={() => navigation.navigate("PolicePVScreen", {})} colors={colors} />
          <ActionBtn label="Garde à vue" icon="lock-closed" color="#DC2626" bg="#FEE2E2" onPress={() => navigation.navigate("PoliceCustody", { complaintId: 0, suspectName: "Nouveau" })} colors={colors} />
          <ActionBtn label="Recherche" icon="shield-search" color="#D97706" bg="#FEF3C7" onPress={() => navigation.navigate("WarrantSearch" as any)} colors={colors} />
          <ActionBtn label="Carte/SOS" icon="map" color="#059669" bg="#D1FAE5" onPress={() => navigation.navigate("NationalMap" as any)} colors={colors} />
        </View>

        {/* 📂 LISTE DES DOSSIERS */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>
              {searchQuery ? "Résultats de recherche" : "Dossiers Récents"}
          </Text>
          {!searchQuery && (
            <TouchableOpacity onPress={() => navigation.navigate("PoliceComplaints" as any)}>
                <Text style={{ color: primaryColor, fontWeight: '800', marginRight: 20, marginTop: 15 }}>VOIR TOUT</Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingCases ? (
          <ActivityIndicator size="large" style={{ marginTop: 40 }} color={primaryColor} />
        ) : (
          <View style={styles.listContainer}>
            {filteredComplaints.length > 0 ? (
              filteredComplaints.slice(0, 6).map((item: any) => (
                <View key={item.id.toString()}>
                  {renderComplaint({ item })}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                  <Ionicons name="folder-open-outline" size={48} color={colors.border} />
                  <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucun dossier à afficher.</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={{ height: 140 }} /> 
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const ActionBtn = ({ label, icon, color, bg, onPress, colors }: any) => (
    <TouchableOpacity 
      style={[styles.actionItem, { backgroundColor: colors.bgCard, borderColor: colors.border }]} 
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: bg }]}><Ionicons name={icon} size={24} color={color} /></View>
      <Text style={[styles.actionLabel, { color: colors.textMain }]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  headerStats: { flexDirection: 'row', padding: 16, alignItems: 'center', gap: 10 },
  clockBox: { flex: 1.5, padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, elevation: 2 },
  clockTime: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  clockDate: { fontSize: 10, fontWeight: '800', marginTop: 2 },
  statBox: { flex: 1, padding: 12, borderRadius: 16, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '900' },
  statLab: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  qrButton: { backgroundColor: '#1E293B', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  qrText: { color: '#FFF', fontSize: 8, fontWeight: '900', marginTop: 4 },
  searchContainer: { paddingHorizontal: 16, marginBottom: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 50, borderRadius: 14, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 10, fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 11, fontWeight: "900", marginHorizontal: 20, marginTop: 20, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  actionItem: { width: '48.5%', padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, elevation: 2 },
  actionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 12, fontWeight: '800' },
  listContainer: { paddingHorizontal: 16 },
  complaintCard: { padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rgNumber: { fontWeight: '900', fontSize: 11, letterSpacing: 0.5 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: '900' },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  citizenRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  citizenName: { fontSize: 12, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  footerInfo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardDate: { fontSize: 11, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { marginTop: 10, fontWeight: '700', fontSize: 13 }
});