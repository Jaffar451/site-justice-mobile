import React, { useState, useMemo, useCallback } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TextInput, 
  TouchableOpacity,
  StatusBar,
  Platform
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Architecture & Thème
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { AdminScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { getSystemLogs, LogEntry } from "../../services/audit.service";

/**
 * Helper: Définit le style visuel selon le type de log
 */
const getLogStyle = (method: string, action: string) => {
  const act = action?.toUpperCase() || "";
  const meth = method?.toUpperCase() || "";

  if (act.includes("DELETE") || meth === "DELETE") 
    return { icon: "trash-outline" as const, color: "#EF4444", label: "SUPPRESSION" };
  
  switch (meth) {
    case "POST": return { icon: "add-circle-outline" as const, color: "#10B981", label: "INSERTION" };
    case "PUT": 
    case "PATCH": return { icon: "refresh-circle-outline" as const, color: "#F59E0B", label: "MAJ" };
    case "GET": return { icon: "eye-outline" as const, color: "#3B82F6", label: "LECTURE" };
    default: return { icon: "shield-checkmark-outline" as const, color: "#64748B", label: "SÉCURITÉ" };
  }
};

export default function AdminLogsScreen({ navigation }: AdminScreenProps<'AdminLogs'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const [search, setSearch] = useState("");

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    line: isDark ? "#334155" : "#E2E8F0",
    endpointBg: isDark ? "#0F172A" : "#F8FAFC",
  };

  // ✅ Chargement automatique
  const { data: rawData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["logs"],
    queryFn: getSystemLogs,
    refetchInterval: 30000, 
  });

  const logs: LogEntry[] = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    return (rawData as any).data || (rawData as any).logs || [];
  }, [rawData]);

  const filteredLogs = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return logs;

    return logs.filter((log: LogEntry) => {
      const actorName = log.actor 
        ? `${log.actor.firstname || ''} ${log.actor.lastname || ''}`.toLowerCase() 
        : "système";
        
      return (
        (log.action && log.action.toLowerCase().includes(term)) ||
        actorName.includes(term) ||
        (log.endpoint && log.endpoint.toLowerCase().includes(term)) ||
        (log.ip && log.ip.includes(term)) ||
        (log.details && log.details.toLowerCase().includes(term))
      );
    });
  }, [logs, search]);

  const renderItem = useCallback(({ item, index }: { item: LogEntry, index: number }) => {
    const style = getLogStyle(item.method, item.action);
    const date = new Date(item.timestamp);
    const isLast = index === filteredLogs.length - 1;
    
    return (
      <View style={styles.timelineRow}>
        {/* Colonne de gauche : Timeline */}
        <View style={styles.timeColumn}>
          <Text style={[styles.timeText, { color: colors.textSub }]}>
            {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {!isLast && <View style={[styles.line, { backgroundColor: colors.line }]} />}
          <View style={[styles.dot, { backgroundColor: style.color, borderColor: colors.bgMain }]} />
        </View>

        {/* Carte du Log */}
        <View style={[
          styles.card, 
          { 
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
            borderLeftColor: style.color 
          }
        ]}>
          <View style={styles.cardHeader}>
            <View style={[styles.badge, { backgroundColor: style.color + "15" }]}>
              <Ionicons name={style.icon} size={12} color={style.color} />
              <Text style={[styles.badgeText, { color: style.color }]}>{style.label}</Text>
            </View>
            <View style={styles.integrityBox}>
              <Ionicons name="finger-print" size={12} color="#10B981" />
              <Text style={styles.integrityText}>SIG: {(item.id || 0).toString().slice(-6).padStart(6, '0')}</Text>
            </View>
          </View>

          <Text style={[styles.actionTitle, { color: colors.textMain }]} numberOfLines={2}>
            {item.details || item.action}
          </Text>
          
          <View style={styles.actorRow}>
            <Ionicons name="person-outline" size={12} color={colors.textSub} />
            <Text style={[styles.actorName, { color: colors.textSub }]}>
              {item.actor ? `${item.actor.firstname} ${item.actor.lastname?.toUpperCase()}` : "SYSTÈME"}
            </Text>
            <View style={[styles.dotSeparator, { backgroundColor: colors.border }]} />
            <Text style={[styles.ipText, { color: colors.textSub }]}>{item.ip || "127.0.0.1"}</Text>
          </View>
          
          <View style={[styles.endpointContainer, { backgroundColor: colors.endpointBg }]}>
            <Text style={[styles.endpointText, { color: colors.textSub }]} numberOfLines={1}>
              {item.method} • {item.endpoint}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [filteredLogs.length, isDark]);

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      
      {/* 🟦 HEADER AVEC RECHERCHE INTÉGRÉE */}
      <View style={[styles.topSection, { backgroundColor: isDark ? "#1E293B" : primaryColor }]}>
        <AppHeader title="Journal d'Audit" showBack={true} white={true} />
        
        <View style={styles.searchPadding}>
          <View style={[styles.searchBar, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
            <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.7)" />
            <TextInput 
              placeholder="IP, Nom, Action..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              selectionColor="#FFF"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={[styles.container, { backgroundColor: colors.bgMain }]}>
        {isLoading && !isRefetching ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : (
          <FlatList
            data={filteredLogs}
            keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
            renderItem={renderItem}
            contentContainerStyle={styles.listPadding}
            onRefresh={refetch}
            refreshing={isRefetching}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="shield-checkmark-outline" size={60} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucune activité suspecte.</Text>
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
  topSection: { 
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 10,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 8 }
    })
  },
  searchPadding: { paddingHorizontal: 20, paddingBottom: 25, paddingTop: 5 },
  searchBar: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 52 
  },
  searchInput: { flex: 1, marginLeft: 12, color: "#FFF", fontWeight: "600", fontSize: 14 },
  
  container: { flex: 1 },
  listPadding: { padding: 20, paddingTop: 30, paddingBottom: 160 }, 
  
  timelineRow: { flexDirection: 'row' },
  timeColumn: { width: 60, alignItems: 'center', position: 'relative' },
  timeText: { fontSize: 11, fontWeight: '900', marginTop: 26, opacity: 0.8 },
  line: { position: 'absolute', width: 2, height: '100%', left: 29, top: 48, zIndex: 1 },
  dot: { width: 14, height: 14, borderRadius: 7, position: 'absolute', left: 23, top: 26, borderWidth: 3, zIndex: 2 },
  
  card: { 
    flex: 1, 
    marginLeft: 12, 
    marginBottom: 16, 
    padding: 18, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderLeftWidth: 6,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8 },
      android: { elevation: 2 }
    })
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 5 },
  badgeText: { fontWeight: "900", fontSize: 9, letterSpacing: 0.8 },
  integrityBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  integrityText: { fontSize: 8, fontWeight: '900', color: '#10B981', opacity: 0.8 },
  
  actionTitle: { fontSize: 13, fontWeight: "800", marginBottom: 10, lineHeight: 20 },
  actorRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  actorName: { fontSize: 11, fontWeight: "700", marginLeft: 6 },
  dotSeparator: { width: 3, height: 3, borderRadius: 1.5, marginHorizontal: 10 },
  ipText: { fontSize: 10, fontWeight: "700", opacity: 0.7 },
  
  endpointContainer: { padding: 10, borderRadius: 10 },
  endpointText: { fontSize: 10, fontWeight: "700", opacity: 0.9, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 15, fontWeight: '700' }
});