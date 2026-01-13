import React from "react"; 
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  StatusBar,
  Platform, // ✅ Indispensable pour la compatibilité Web
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Surface, Button, List, ActivityIndicator, Switch, Divider } from "react-native-paper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Architecture
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import { useAppTheme } from "../../theme/AppThemeProvider";

// ✅ SERVICES API
import { 
  getSystemHealth, 
  getSystemLogs, 
  clearServerCache,
  getMaintenanceStatus, 
  setMaintenanceStatus  
} from "../../services/admin.service";

export default function AdminMaintenanceScreen({ navigation }: any) {
  const { theme, isDark } = useAppTheme();
  const queryClient = useQueryClient();
  
  // 1. SANTÉ SYSTÈME
  const { data: health, isLoading: loadingHealth, refetch: refetchHealth } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: getSystemHealth,
    refetchInterval: 30000, 
  });

  // 2. LOGS SYSTÈME
  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ['systemLogs'],
    queryFn: getSystemLogs,
  });

  // 3. ÉTAT MAINTENANCE
  const { data: maintenanceData, isLoading: loadingMaint } = useQuery({
    queryKey: ['maintenanceStatus'],
    queryFn: getMaintenanceStatus,
  });

  // 4. MUTATION : ACTIVER/DÉSACTIVER MAINTENANCE
  const maintenanceMutation = useMutation({
    mutationFn: setMaintenanceStatus,
    onSuccess: (newData) => {
      queryClient.setQueryData(['maintenanceStatus'], newData); 
      const state = newData.data.isActive ? "ACTIVÉ" : "DÉSACTIVÉ";
      
      // Feedback adapté au support
      if (Platform.OS === 'web') {
          window.alert(`Mise à jour réussie : Mode Maintenance ${state}`);
      } else {
          Alert.alert("Mise à jour réussie", `Le Mode Maintenance est désormais ${state}.`);
      }
    },
    onError: () => {
        const msg = "Impossible de changer le mode maintenance.";
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Erreur", msg);
    }
  });

  // 5. MUTATION : VIDER CACHE
  const clearCacheMutation = useMutation({
    mutationFn: clearServerCache,
    onSuccess: () => {
        const msg = "Le cache serveur a été vidé.";
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Succès", msg);
    },
    onError: () => {
        const msg = "Impossible de vider le cache.";
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Erreur", msg);
    }
  });

  const onRefresh = () => {
    refetchHealth();
    queryClient.invalidateQueries({ queryKey: ['systemLogs'] });
    queryClient.invalidateQueries({ queryKey: ['maintenanceStatus'] });
  };

  // ✅ CORRECTION DU BOUTON (Gestion Web vs Mobile)
  const toggleMaintenance = () => {
    const currentState = maintenanceData?.data?.isActive || false;
    const message = currentState 
        ? "Désactiver la maintenance ? Les utilisateurs pourront se reconnecter." 
        : "⚠️ Activer la maintenance ? Seuls les admins auront accès.";

    if (Platform.OS === 'web') {
        // Sur Web, on utilise window.confirm car Alert.alert ne gère pas les choix
        if (window.confirm(message)) {
            maintenanceMutation.mutate({ isActive: !currentState });
        }
    } else {
        // Sur Mobile, on utilise l'alerte native
        Alert.alert(
          "Confirmation",
          message,
          [
            { text: "Annuler", style: "cancel" },
            { 
              text: "Confirmer", 
              onPress: () => maintenanceMutation.mutate({ isActive: !currentState }),
              style: currentState ? "default" : "destructive"
            }
          ]
        );
    }
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

  const getLogColor = (status: number) => {
      if (status >= 500) return colors.error;
      if (status >= 400) return colors.warning;
      return colors.success; 
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
          <StatusCard label="Serveur API" value={health?.serverStatus || "Connexion..."} status={health?.serverStatus === 'OK' ? 'ok' : 'error'} colors={colors} icon="server" />
          <StatusCard label="Base de Données" value={health?.dbStatus || "..."} status={health?.dbStatus === 'Connected' ? 'ok' : 'error'} colors={colors} icon="file-tray-full" />
          <StatusCard label="Latence API" value={health?.latency ? `${health.latency}ms` : "--"} status={health?.latency < 200 ? 'ok' : 'warning'} colors={colors} icon="pulse" />
          <StatusCard label="Version API" value={health?.version || "v1.0"} status="info" colors={colors} icon="git-branch" />
        </View>

        {/* 🛠️ ACTIONS TECHNIQUES */}
        <Text style={[styles.sectionTitle, { color: colors.textSub, marginTop: 25 }]}>ACTIONS TECHNIQUES</Text>
        <Surface style={[styles.card, { backgroundColor: colors.bgCard }]} elevation={2}>
            
            {/* ✅ INTERRUPTEUR MAINTENANCE (Corrigé pour le clic) */}
            <List.Item
              title="Mode Maintenance"
              description="Bloque l'accès utilisateur"
              left={props => <List.Icon {...props} icon="alert-octagon" color={maintenanceData?.data?.isActive ? colors.error : colors.textSub} />}
              right={() => (
                <View pointerEvents="auto">
                    <Switch 
                      value={maintenanceData?.data?.isActive || false} 
                      onValueChange={toggleMaintenance} 
                      color={colors.error}
                      // On enlève le disabled strict pour permettre de cliquer même si chargement léger
                      disabled={false} 
                    />
                </View>
              )}
            />
            <Divider style={{ backgroundColor: colors.border }} />

            <List.Item
              title="Vider le Cache Serveur"
              description="Force le rechargement des configs"
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

        {/* 📜 LOGS BACKEND */}
        <Text style={[styles.sectionTitle, { color: colors.textSub, marginTop: 25 }]}>LOGS SERVEUR (DERNIÈRES 24H)</Text>
        <View style={[styles.logsContainer, { backgroundColor: "#0F172A" }]}>
            {loadingLogs ? (
                <ActivityIndicator color="#FFF" style={{ padding: 20 }} />
            ) : logs && logs.length > 0 ? (
                logs.map((log: any, index: number) => {
                    const statusColor = getLogColor(log.status || 200);
                    return (
                        <View key={index} style={styles.logRow}>
                            <Text style={styles.logTime}>
                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"}
                            </Text>
                            <Text style={[styles.logType, { color: statusColor }]}>
                                {log.method} {log.status}
                            </Text>
                            <Text style={styles.logMsg} numberOfLines={1}>
                                {log.endpoint || log.action}
                            </Text>
                        </View>
                    );
                })
            ) : (
                <Text style={{ color: '#64748B', textAlign: 'center', padding: 20 }}>Aucun log récent.</Text>
            )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// 📦 COMPOSANTS HELPER
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
  logRow: { flexDirection: 'row', marginBottom: 8, gap: 10, alignItems: 'center' },
  logTime: { color: '#64748B', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, width: 40 },
  logType: { fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, width: 70 },
  logMsg: { color: '#E2E8F0', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, flex: 1 },
});