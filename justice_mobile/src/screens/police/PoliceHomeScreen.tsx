import React from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl, 
  StatusBar,
  ActivityIndicator,
  Platform,
  ViewStyle
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Imports Architecture Alignés
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Changé pour le hook dynamique
import { PoliceScreenProps } from "../../types/navigation";

// Composants de mise en page
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { getAllComplaints, Complaint } from "../../services/complaint.service";

interface BadgeConfig {
  color: string;
  label: string;
  icon: string;
}

const getStatusBadge = (status: string): BadgeConfig => {
  switch (status) {
    case "soumise": 
      return { color: "#E65100", label: "À TRAITER", icon: "alert-circle-outline" };
    case "en_cours_OPJ": 
      return { color: "#1976D2", label: "ENQUÊTE", icon: "shield-half-outline" };
    case "attente_validation": 
      return { color: "#9C27B0", label: "VISA CHEF", icon: "checkmark-done-circle-outline" };
    case "transmise_parquet": 
      return { color: "#388E3C", label: "PARQUET", icon: "send-outline" };
    default: 
      return { color: "#607D8B", label: status?.toUpperCase() || "INCONNU", icon: "help-circle-outline" };
  }
};

export default function PoliceHomeScreen({ navigation }: PoliceScreenProps<'PoliceHome'>) {
  // ✅ 2. Thème Dynamique & Auth
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore(); 

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    divider: isDark ? "#334155" : "#F1F5F9",
  };

  const { data: complaints, isLoading, refetch } = useQuery({
    queryKey: ["all-complaints"],
    queryFn: getAllComplaints,
  });

  const isGendarme = user?.organization === "GENDARMERIE";
  const unitLabel = isGendarme ? "Brigade" : "Commissariat";
  const registryTitle = isGendarme ? "Registre Gendarmerie" : "Registre Police";

  const sortedComplaints = React.useMemo(() => {
    if (!complaints) return [];
    return [...complaints].sort((a, b) => {
      if (a.status === "soumise" && b.status !== "soumise") return -1;
      if (a.status !== "soumise" && b.status === "soumise") return 1;
      return new Date(b.filedAt || 0).getTime() - new Date(a.filedAt || 0).getTime();
    });
  }, [complaints]);

  const renderItem = ({ item }: { item: Complaint }) => {
    const badge = getStatusBadge(item.status);
    const isNew = item.status === "soumise";
    
    return (
      <TouchableOpacity 
        activeOpacity={0.85}
        style={[
          styles.card, 
          { 
            backgroundColor: colors.bgCard,
            borderColor: isNew ? badge.color : colors.border,
            borderLeftColor: isNew ? badge.color : colors.border,
            borderLeftWidth: isNew ? 6 : 1
          }
        ]}
        onPress={() => navigation.navigate("PoliceComplaintDetails", { complaintId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.refRow}>
            <Text style={[styles.idLabel, { color: primaryColor }]}>RG #{item.id}</Text>
            <Text style={[styles.dateText, { color: colors.textSub }]}>
                • {item.filedAt ? new Date(item.filedAt).toLocaleDateString("fr-FR") : "--/--"}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: badge.color + "15" }]}>
            <Ionicons name={badge.icon as any} size={14} color={badge.color} />
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        <Text style={[styles.offenceTitle, { color: colors.textMain }]} numberOfLines={1}>
          {item.provisionalOffence || item.title || "Dossier sans qualification"}
        </Text>

        <Text style={[styles.descriptionText, { color: colors.textSub }]} numberOfLines={2}>
          {item.description || "Aucune description fournie."}
        </Text>

        <View style={[styles.cardFooter, { borderTopColor: colors.divider }]}>
          <View style={styles.locationInfo}>
             <Ionicons name="location-outline" size={14} color={colors.textSub} />
             <Text style={[styles.locationText, { color: colors.textSub }]} numberOfLines={1}>
               {item.location || "Localisation non précisée"}
             </Text>
          </View>
          
          <View style={styles.actionPrompt}>
            <Text style={[styles.actionText, { color: primaryColor }]}>
                {isNew ? "INSTRUIRE" : "CONSULTER"}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={primaryColor} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <AppHeader title={registryTitle} showMenu={true} />
      
      {/* 🏗️ BANNIÈRE D'UNITÉ */}
      <View style={[styles.unitBanner, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderBottomColor: colors.border }]}>
          <Ionicons name="business" size={16} color={primaryColor} />
          <Text style={[styles.unitHeaderText, { color: colors.textSub }]}>
            {unitLabel} : <Text style={[styles.unitCountText, { color: colors.textMain }]}>
              {isLoading ? "..." : (sortedComplaints?.length || 0)} Dossier(s) actifs
            </Text>
          </Text>
      </View>

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        {isLoading ? (
            <View style={styles.center}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={[styles.loadingText, { color: colors.textSub }]}>Accès au registre sécurisé...</Text>
            </View>
        ) : (
            <FlatList
            data={sortedComplaints}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl 
                refreshing={isLoading} 
                onRefresh={refetch} 
                tintColor={primaryColor} 
                />
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                    <Ionicons name="file-tray-outline" size={60} color={colors.textSub} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.textMain }]}>Registre vide</Text>
                <Text style={[styles.emptySub, { color: colors.textSub }]}>
                    Aucune plainte ou procédure n'est actuellement enregistrée.
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 15, fontSize: 13, fontWeight: "700", letterSpacing: 0.5 },
  
  unitBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    gap: 10,
    borderBottomWidth: 1,
  },
  unitHeaderText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  unitCountText: { fontWeight: '900' },
  
  listContent: { paddingHorizontal: 16, paddingTop: 15, paddingBottom: 140 },
  
  card: {
    padding: 20, 
    borderRadius: 24, 
    marginBottom: 16,
    borderWidth: 1, 
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.1)" }
    })
  } as ViewStyle,
  
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14, alignItems: 'center' },
  refRow: { flexDirection: 'row', alignItems: 'center' },
  idLabel: { fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  dateText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  
  offenceTitle: { fontSize: 17, fontWeight: "900", marginBottom: 6, letterSpacing: -0.5 },
  descriptionText: { fontSize: 13, marginBottom: 20, lineHeight: 20, fontWeight: '500' },
  
  cardFooter: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: 'space-between', 
    borderTopWidth: 1.5, 
    paddingTop: 15,
  },
  locationInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  locationText: { fontSize: 11, fontWeight: '800' },
  actionPrompt: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontWeight: '900', fontSize: 11 },

  emptyContainer: { alignItems: "center", marginTop: 80, paddingHorizontal: 50 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  emptySub: { fontSize: 14, marginTop: 10, textAlign: 'center', lineHeight: 22, fontWeight: "500" }
});