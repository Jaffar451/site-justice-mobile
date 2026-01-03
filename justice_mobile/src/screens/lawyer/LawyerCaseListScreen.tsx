import React, { useState, useMemo, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

// ✅ 1. Imports Architecture
import { getAppTheme } from "../../theme";
import { LawyerScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { getAllComplaints, Complaint } from "../../services/complaint.service";

export default function LawyerCaseListScreen({ navigation }: LawyerScreenProps<'LawyerCaseList'>) {
  // ✅ 2. Thème via Helper
  const theme = getAppTheme();
  const primaryColor = theme.color;
  
  const [search, setSearch] = useState("");

  // 🔄 Récupération des dossiers liés à l'avocat
  const { data: cases, isLoading, refetch } = useQuery({
    queryKey: ["lawyer-cases"],
    queryFn: getAllComplaints,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // 🔍 Logique de recherche (Client, Délit ou n° RG)
  const filteredCases = useMemo(() => {
    if (!cases) return [];
    const term = search.toLowerCase();
    return (cases as Complaint[]).filter(c => 
      c.id.toString().includes(term) ||
      (c.citizen?.firstname + " " + c.citizen?.lastname).toLowerCase().includes(term) ||
      (c.provisionalOffence || "").toLowerCase().includes(term)
    );
  }, [cases, search]);

  const getStatusBadge = (status: string) => {
    const config: any = {
      instruction: { label: "INSTRUCTION", color: "#F59E0B" },
      audience_programmée: { label: "AUDIENCE", color: "#10B981" },
      transmise_parquet: { label: "AU PARQUET", color: "#3B82F6" },
      jugée: { label: "DÉCISION RENDUE", color: "#64748B" },
    };
    return config[status] || { label: status.toUpperCase(), color: "#94A3B8" };
  };

  const renderCaseItem = ({ item }: { item: Complaint }) => {
    const status = getStatusBadge(item.status);
    const clientName = item.citizen 
      ? `${item.citizen.firstname} ${item.citizen.lastname}`
      : "Client Étatique";

    return (
      <TouchableOpacity 
        activeOpacity={0.85}
        style={[styles.card, { backgroundColor: "#FFF", borderColor: "#F1F5F9" }]}
        onPress={() => navigation.navigate("LawyerCaseDetail", { caseId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.caseRef, { color: primaryColor }]}>N° RG {item.id}/2025</Text>
          <View style={[styles.badge, { backgroundColor: status.color + "15" }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.clientRow}>
          <View style={styles.clientIcon}>
             <Ionicons name="person-circle" size={42} color="#CBD5E1" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.clientName}>{clientName}</Text>
            <Text style={styles.offenceText} numberOfLines={1}>
              {item.provisionalOffence || "Qualification en cours d'examen"}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.dateInfo}>
            <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
            <Text style={styles.dateText}>Saisi le {new Date(item.filedAt).toLocaleDateString("fr-FR")}</Text>
          </View>
          <View style={styles.actionLink}>
            <Text style={[styles.linkText, { color: primaryColor }]}>Consulter</Text>
            <Ionicons name="arrow-forward" size={14} color={primaryColor} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Portefeuille Dossiers" showBack />

      {/* 🔍 BARRE DE RECHERCHE DYNAMIQUE */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            placeholder="Rechercher client ou n° RG..."
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={styles.loaderText}>Accès au Barreau numérique...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCases}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCaseItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={primaryColor} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={64} color="#E2E8F0" />
              <Text style={styles.emptyText}>
                {search ? "Aucun dossier trouvé pour cette recherche." : "Vous n'avez aucun dossier actif dans votre portefeuille."}
              </Text>
            </View>
          }
        />
      )}

      {/* ✅ SmartFooter autonome */}
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 15, fontSize: 13, color: "#64748B", fontWeight: "600" },
  
  searchWrapper: { 
    padding: 16, 
    backgroundColor: "#FFF", 
    borderBottomWidth: 1, 
    borderBottomColor: "#F1F5F9" 
  },
  searchInputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 15, 
    height: 50, 
    borderRadius: 14, 
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  input: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: "500", color: "#1E293B" },
  
  listContent: { padding: 16, paddingBottom: 120 },
  card: { 
    padding: 20, 
    borderRadius: 24, 
    marginBottom: 16, 
    borderWidth: 1, 
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 }
    })
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  caseRef: { fontSize: 13, fontWeight: "900", letterSpacing: 0.5 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  
  clientRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  clientIcon: { marginRight: 15 },
  clientName: { fontSize: 17, fontWeight: "800", color: "#1E293B" },
  offenceText: { fontSize: 12, fontWeight: "600", color: "#64748B", marginTop: 2 },
  
  cardFooter: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    borderTopWidth: 1, 
    borderTopColor: "#F8FAFC", 
    paddingTop: 15 
  },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 11, color: "#94A3B8", fontWeight: "700" },
  actionLink: { flexDirection: "row", alignItems: "center", gap: 6 },
  linkText: { fontSize: 12, fontWeight: "900", textTransform: 'uppercase' },
  
  emptyContainer: { alignItems: "center", marginTop: 100, paddingHorizontal: 40 },
  emptyText: { fontSize: 14, fontWeight: "600", textAlign: "center", color: "#94A3B8", marginTop: 15, lineHeight: 22 }
});