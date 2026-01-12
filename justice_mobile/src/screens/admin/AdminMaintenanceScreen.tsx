import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  StatusBar,
  Platform,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Surface, Button, Switch, List, ActivityIndicator } from "react-native-paper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // ✅ VRAI SYSTÈME

// Architecture
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { getSystemHealth, getSystemLogs, clearServerCache } from "../../services/admin.service"; // ✅ IMPORT API

export default function AdminMaintenanceScreen({ navigation }: any) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const queryClient = useQueryClient();
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // ✅ 1. RÉCUPÉRATION DES VRAIES DONNÉES SYSTÈME
  const { data: health, isLoading: loadingHealth, refetch: refetchHealth } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: getSystemHealth,
    refetchInterval: 30000, // Rafraîchir toutes les 30s
  });

  // ✅ 2. RÉCUPÉRATION DES VRAIS LOGS
  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ['systemLogs'],
    queryFn: getSystemLogs,
  });

  // ✅ 3. ACTION RÉELLE : VIDER LE CACHE SERVEUR
  const clearCacheMutation = useMutation({
    mutationFn: clearServerCache,
    onSuccess: () => Alert.alert("Succès", "Le cache serveur a été vidé."),
    onError: () => Alert.alert("Erreur", "Impossible de vider le cache.")
  });

  const onRefresh = () => {
    refetchHealth();
    queryClient.invalidateQueries({ queryKey: ['systemLogs'] });
  };

  const colors = {
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444"
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Maintenance Système" showBack={true} />

      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loadingHealth} onRefresh={onRefresh} />}
      >
        
        {/* 🟢 ÉTAT RÉEL DU SYSTÈME */}
        <Text style={[styles.sectionTitle, { color: colors.textSub }]}>ÉTAT DES SERVICES (LIVE)</Text>
        <View style={styles.grid}>
          <StatusCard 
            label="Serveur API" 
            value={health?.serverStatus || "Connexion..."} 
            status={health?.serverStatus === 'OK' ? 'ok' : 'error'} 
            colors={colors} icon="server" 
          />
          <StatusCard 
            label="Base de Données" 
            value={health?.dbStatus || "..."} 
            status={health?.dbStatus === 'Connected' ? 'ok' : 'error'} 
            colors={colors} icon="file-tray-full" 
          />
          <StatusCard 
            label="Latence API" 
            value={health?.latency ? `${health.latency}ms` : "--"} 
            status={health?.latency < 200 ? 'ok' : 'warning'} 
            colors={colors} icon="pulse" 
          />
          <StatusCard 
            label="Version API" 
            value={health?.version || "v1.0"} 
            status="info" 
            colors={colors} icon="git-branch" 
          />
        </View>

        {/* 🛠️ ACTIONS TECHNIQUES RÉELLES */}
        <Text style={[styles.sectionTitle, { color: colors.textSub, marginTop: 25 }]}>ACTIONS TECHNIQUES</Text>
        <Surface style={[styles.card, { backgroundColor: colors.bgCard }]} elevation={2}>
            
            <List.Item
              title="Vider le Cache Serveur"
              description="Force le rechargement des configurations"
              left={props => <List.Icon {...props} icon="broom" color={colors.warning} />}
              right={() => (
                <Button 
                    mode="outlined" 
                    onPress={() => clearCacheMutation.mutate()} 
                    loading={clearCacheMutation.isPending}
                    textColor={colors.warning} 
                    style={{borderColor: colors.warning}}
                >
                    Nettoyer
                </Button>
              )}
            />
        </Surface>

        {/* 📜 LOGS RÉELS VENANT DU BACKEND */}
        <Text style={[styles.sectionTitle, { color: colors.textSub, marginTop: 25 }]}>LOGS SERVEUR (DERNIÈRES 24H)</Text>
        <View style={[styles.logsContainer, { backgroundColor: "#0F172A" }]}>
            {loadingLogs ? (
                <ActivityIndicator color="#FFF" style={{ padding: 20 }} />
            ) : logs && logs.length > 0 ? (
                logs.map((log: any, index: number) => (
                    <View key={index} style={styles.logRow}>
                        <Text style={styles.logTime}>{new Date(log.created_at).toLocaleTimeString()}</Text>
                        <Text style={[styles.logType, { 
                            color: log.level === 'INFO' ? '#60A5FA' : log.level === 'WARNING' ? '#FBBF24' : '#F87171' 
                        }]}>{log.level}</Text>
                        <Text style={styles.logMsg} numberOfLines={1}>{log.message}</Text>
                    </View>
                ))
            ) : (
                <Text style={{ color: '#64748B', textAlign: 'center', padding: 20 }}>Aucun log récent.</Text>
            )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const StatusCard = ({ label, value, status, colors, icon }: any) => {
    const getColor = () => {
        if (status === 'ok') return colors.success;
        if (status === 'warning') return colors.warning;
        if (status === 'error') return colors.error;
        return colors.textMain;
    };

    return (
        <View style={[styles.statusCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Ionicons name={icon} size={24} color={getColor()} style={{ marginBottom: 8 }} />
            <Text style={[styles.statusValue, { color: colors.textMain }]}>{value}</Text>
            <Text style={[styles.statusLabel, { color: colors.textSub }]}>{label}</Text>
            <View style={[styles.statusDot, { backgroundColor: getColor() }]} />
        </View>
    );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase', marginLeft: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statusCard: { 
      width: '48%', padding: 16, borderRadius: 16, borderWidth: 1, 
      alignItems: 'flex-start', position: 'relative', overflow: 'hidden'
  },
  statusValue: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  statusLabel: { fontSize: 11, fontWeight: '600' },
  statusDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4 },
  card: { borderRadius: 16, padding: 8, overflow: 'hidden' },
  logsContainer: { borderRadius: 12, padding: 16 },
  logRow: { flexDirection: 'row', marginBottom: 8, gap: 10 },
  logTime: { color: '#64748B', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11 },
  logType: { fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, width: 55 },
  logMsg: { color: '#E2E8F0', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, flex: 1 },
});