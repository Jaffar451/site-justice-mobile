import React, { useState, useMemo, useCallback } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  RefreshControl, 
  StatusBar,
  Platform,
  Keyboard
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Architecture & Store
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { PoliceScreenProps } from "../../types/navigation";

// Composants UI
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { getMyComplaints, Complaint } from "../../services/complaint.service";

export default function PoliceCasesScreen({ navigation }: PoliceScreenProps<'PoliceCases'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  
  const [search, setSearch] = useState("");

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#F8FAFC",
    divider: isDark ? "#334155" : "#F1F5F9",
  };

  // 🔄 Récupération des dossiers (via React Query pour le cache)
  const { data: complaints, isLoading, refetch } = useQuery<Complaint[]>({
    queryKey: ["my-complaints"],
    queryFn: getMyComplaints,
  });

  // Rafraîchir les données quand l'écran revient au premier plan
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // 🔍 Filtrage dynamique multi-critères
  const filteredCases = useMemo(() => {
    if (!complaints) return [];
    const term = search.toLowerCase().trim();
    
    return complaints.filter(c => 
      (c.title?.toLowerCase() || "").includes(term) ||
      (c.description?.toLowerCase() || "").includes(term) ||
      (c.id?.toString() || "").includes(term) ||
      (c.trackingCode?.toLowerCase() || "").includes(term)
    );
  }, [complaints, search]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "en_cours_OPJ": 
        return { color: "#F59E0B", label: "ENQUÊTE EN COURS", icon: "search-outline" };
      case "attente_validation": 
        return { color: "#7C3AED", label: "VISA HIÉRARCHIQUE", icon: "shield-half-outline" };
      case "transmise_parquet": 
        return { color: "#10B981", label: "TRANSMIS AU PARQUET", icon: "checkmark-done-circle-outline" };
      case "soumise": 
        return { color: "#2563EB", label: "DOSSIER OUVERT", icon: "folder-open-outline" };
      default: 
        return { color: "#64748B", label: "ARCHIVÉ", icon: "archive-outline" };
    }
  };

  const renderItem = ({ item }: { item: Complaint }) => {
    const badge = getStatusBadge(item.status);
    const dateStr = item.createdAt || item.filedAt || new Date().toISOString();
    const formattedDate = new Date(dateStr).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric' });

    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        style={[
          styles.card, 
          { backgroundColor: colors.bgCard, borderColor: colors.border }
        ]}
        onPress={() => navigation.navigate("PoliceComplaintDetails", { complaintId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.idBadge, { backgroundColor: primaryColor + "15" }]}>
            <Text style={[styles.idText, { color: primaryColor }]}>RG #{item.id}</Text>
          </View>
          <Text style={[styles.date, { color: colors.textSub }]}>{formattedDate}</Text>
        </View>

        <Text style={[styles.title, { color: colors.textMain }]} numberOfLines={1}>
          {item.title || "Dossier d'investigation sans titre"}
        </Text>
        
        <Text style={[styles.desc, { color: colors.textSub }]} numberOfLines={2}>
          {item.description || "Aucun résumé disponible pour ce dossier."}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.footerRow}>
          <View style={[styles.statusBadge, { backgroundColor: badge.color + "15" }]}>
            <Ionicons name={badge.icon as any} size={14} color={badge.color} style={{ marginRight: 6 }} />
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Registre des Enquêtes" showMenu={true} />

      {/* 🔍 Barre de Recherche Tactile */}
      <View style={[styles.searchContainer, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textSub} />
          <TextInput 
            placeholder="Rechercher par RG, nom ou motif..."
            placeholderTextColor={colors.textSub}
            style={[styles.searchInput, { color: colors.textMain }]}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color={colors.textSub} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        {isLoading && !complaints ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={[styles.loadingText, { color: colors.textSub }]}>Liaison sécurisée...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCases}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={primaryColor} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="file-tray-outline" size={80} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.textMain }]}>Aucun dossier</Text>
                <Text style={[styles.emptyText, { color: colors.textSub }]}>
                  {search.length > 0 
                    ? `Aucune enquête ne correspond à "${search}".` 
                    : "Votre répertoire d'investigation est actuellement vide."}
                </Text>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 12, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 1 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 48, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '600' },
  listPadding: { paddingHorizontal: 16, paddingTop: 15, paddingBottom: 120 },
  card: { 
    padding: 18, 
    borderRadius: 22, 
    marginBottom: 15, 
    borderWidth: 1.5, 
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, alignItems: 'center' },
  idBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  idText: { fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
  date: { fontSize: 11, fontWeight: "700", opacity: 0.8 },
  title: { fontSize: 17, fontWeight: "900", marginBottom: 8, letterSpacing: -0.5 },
  desc: { fontSize: 13, lineHeight: 20, marginBottom: 16, fontWeight: '500' },
  divider: { height: 1, marginBottom: 14, opacity: 0.1 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  emptyContainer: { alignItems: "center", marginTop: 100, paddingHorizontal: 50 },
  emptyTitle: { fontSize: 20, fontWeight: '900', marginTop: 20, marginBottom: 8 },
  emptyText: { textAlign: 'center', fontSize: 14, lineHeight: 22, fontWeight: '500' }
});