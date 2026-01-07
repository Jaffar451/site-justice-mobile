import React, { useState, useMemo } from "react";
import { View, StyleSheet, Text, FlatList, ActivityIndicator, RefreshControl, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import "dayjs/locale/fr";

// ✅ Architecture & Thème
import { AdminScreenProps } from "../../types/navigation";
import { useAppTheme } from "../../theme/AppThemeProvider";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";

// Services (Assurez-vous que ce service existe)
import { getAuditLogs } from "../../services/audit.service";

interface AuditLog {
  id: number;
  action: string;
  module: string;
  userId: number;
  userName: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  createdAt: string;
  severity: "info" | "warning" | "danger";
}

export default function AdminAuditTrailScreen({ navigation }: AdminScreenProps<'AdminAuditTrail'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
  };

  // 1️⃣ RÉCUPÉRATION DES LOGS
  const { data: logsRaw, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: getAuditLogs,
    refetchInterval: 30000, // Rafraîchissement auto toutes les 30s
  });

  const logs: AuditLog[] = useMemo(() => (logsRaw as any)?.data || logsRaw || [], [logsRaw]);

  const getActionIcon = (action: string, severity: string) => {
    if (severity === 'danger') return { icon: "alert-circle", color: "#EF4444" };
    if (action.includes("LOGIN")) return { icon: "log-in-outline", color: "#3B82F6" };
    if (action.includes("CREATE")) return { icon: "add-circle-outline", color: "#10B981" };
    if (action.includes("DELETE")) return { icon: "trash-outline", color: "#EF4444" };
    return { icon: "finger-print-outline", color: colors.textSub };
  };

  const renderLogItem = ({ item }: { item: AuditLog }) => {
    const config = getActionIcon(item.action, item.severity);
    
    return (
      <View style={[styles.logCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <View style={[styles.statusStrip, { backgroundColor: config.color }]} />
        
        <View style={styles.logContent}>
          <View style={styles.logHeader}>
            <View style={styles.actionRow}>
              <Ionicons name={config.icon as any} size={16} color={config.color} />
              <Text style={[styles.actionText, { color: colors.textMain }]}>{item.action}</Text>
            </View>
            <Text style={[styles.timeText, { color: colors.textSub }]}>
              {dayjs(item.createdAt).locale('fr').format('HH:mm:ss')}
            </Text>
          </View>

          <Text style={[styles.detailsText, { color: colors.textMain }]}>{item.details}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.actorBox}>
              <Ionicons name="person-outline" size={12} color={colors.textSub} />
              <Text style={[styles.metaText, { color: colors.textSub }]}>{item.userName}</Text>
            </View>
            <View style={styles.actorBox}>
              <Ionicons name="globe-outline" size={12} color={colors.textSub} />
              <Text style={[styles.metaText, { color: colors.textSub }]}>{item.ipAddress}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Journal de Sécurité" showBack />
      
      <View style={[styles.container, { backgroundColor: colors.bgMain }]}>
        <View style={styles.statsOverview}>
          <Text style={[styles.sectionLabel, { color: colors.textSub }]}>FLUX D'ACTIVITÉ NATIONAL</Text>
          <Text style={[styles.logCount, { color: primaryColor }]}>{logs.length} Événements tracés</Text>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderLogItem}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={primaryColor} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="shield-outline" size={60} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucune activité suspecte détectée.</Text>
              </View>
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  statsOverview: { padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
  sectionLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  logCount: { fontSize: 22, fontWeight: "900", marginTop: 4 },
  
  listContent: { padding: 15, paddingBottom: 100 },
  logCard: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 2 }
    })
  },
  statusStrip: { width: 5 },
  logContent: { flex: 1, padding: 15 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionText: { fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
  timeText: { fontSize: 11, fontWeight: "600" },
  detailsText: { fontSize: 14, fontWeight: "500", marginBottom: 12, lineHeight: 20 },
  
  metaRow: { flexDirection: 'row', gap: 15, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 10 },
  actorBox: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 11, fontWeight: "700" },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontWeight: "700" }
});