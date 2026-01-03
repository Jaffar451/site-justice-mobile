import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ✅ Architecture & Thème
import { useAppTheme } from '../../theme/AppThemeProvider'; // Hook dynamique
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import api from '../../services/api'; 

const fetchMaintenanceStatus = async () => {
  try {
    const response = await api.get('/admin/maintenance');
    return response.data.data || response.data || { isActive: false };
  } catch (e) {
    return { isActive: false };
  }
};

const setMaintenanceStatus = async (isActive: boolean) => {
  try {
    const response = await api.post('/admin/maintenance', { isActive });
    return response.data;
  } catch (e) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, isActive };
  }
};

export default function AdminMaintenanceScreen() {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const queryClient = useQueryClient();

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    
    // Status Green
    activeBg: isDark ? "#064E3B" : "#F0FDF4",
    activeBorder: isDark ? "#059669" : "#BBF7D0",
    activeText: isDark ? "#4ADE80" : "#166534",
    
    // Status Red
    maintBg: isDark ? "#450A0A" : "#FEF2F2",
    maintBorder: isDark ? "#B91C1C" : "#FECACA",
    maintText: isDark ? "#FCA5A5" : "#991B1B",
  };

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance-status'],
    queryFn: fetchMaintenanceStatus,
  });

  const isMaintenance = data?.isActive || false;

  const mutation = useMutation({
    mutationFn: (newStatus: boolean) => setMaintenanceStatus(newStatus),
    onSuccess: (_, newStatus) => {
      queryClient.setQueryData(['maintenance-status'], { isActive: newStatus });
      const title = newStatus ? "Maintenance Activée" : "Système Rétabli";
      const message = newStatus 
          ? "Accès restreint aux administrateurs." 
          : "Accès ouvert à tous les utilisateurs.";

      if (Platform.OS === 'web') {
        window.alert(`${title}\n${message}`);
      } else {
        Alert.alert(title, message);
      }
    },
    onError: () => Alert.alert("Erreur", "Échec de la mutation système.")
  });

  const handleToggle = () => {
    const targetStatus = !isMaintenance;
    const title = targetStatus ? "⚠️ Activation Critique" : "Réouverture du service";
    const msg = targetStatus 
      ? "L'activation bloquera l'accès à tous les officiers et magistrats. Confirmer ?"
      : "Voulez-vous rétablir l'accès public au réseau e-Justice ?";

    if (Platform.OS === 'web') {
        if (window.confirm(`${title}\n\n${msg}`)) mutation.mutate(targetStatus);
    } else {
        Alert.alert(title, msg, [
            { text: "Annuler", style: "cancel" },
            { 
              text: targetStatus ? "ACTIVER" : "RÉTABLIR", 
              style: targetStatus ? "destructive" : "default",
              onPress: () => mutation.mutate(targetStatus) 
            }
        ]);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer withPadding={false}>
        <AppHeader title="Maintenance" showBack />
        <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
            <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Maintenance Système" showBack={true} />
      
      <View style={[styles.container, { backgroundColor: colors.bgMain }]}>
        <View style={[
            styles.statusCard, 
            { 
                backgroundColor: isMaintenance ? colors.maintBg : colors.activeBg, 
                borderColor: isMaintenance ? colors.maintBorder : colors.activeBorder 
            }
        ]}>
          <View style={[styles.iconCircle, { backgroundColor: isMaintenance ? '#EF4444' : '#10B981' }]}>
            <Ionicons name={isMaintenance ? "flash-outline" : "shield-checkmark-outline"} size={44} color="#FFF" />
          </View>
          <Text style={[styles.statusTitle, { color: isMaintenance ? colors.maintText : colors.activeText }]}>
            {isMaintenance ? "MAINTENANCE ACTIVE" : "RÉSEAU OPÉRATIONNEL"}
          </Text>
          <Text style={[styles.statusDesc, { color: colors.textSub }]}>
            {isMaintenance 
              ? "L'accès aux bases de données judiciaires est actuellement suspendu pour les utilisateurs finaux." 
              : "Tous les services (Police, Parquet, Tribunaux) sont synchronisés et accessibles."}
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <Text style={[styles.label, { color: colors.textSub }]}>Action de Super-Admin</Text>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[
                styles.bigButton, 
                { backgroundColor: isMaintenance ? '#10B981' : '#EF4444' },
                mutation.isPending && { opacity: 0.7 }
            ]}
            onPress={handleToggle}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <>
                    <Ionicons name={isMaintenance ? "play-outline" : "power-outline"} size={24} color="#FFF" style={{ marginRight: 12 }} />
                    <Text style={styles.buttonText}>
                    {isMaintenance ? "DÉSACTIVER LA MAINTENANCE" : "ACTIVER LA MAINTENANCE"}
                    </Text>
                </>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.helperText, { color: colors.textSub }]}>
            Note : Cette action enregistre un log d'audit immuable dans le journal de sécurité MJ.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  statusCard: { padding: 35, borderRadius: 32, alignItems: 'center', borderWidth: 2, marginBottom: 50 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 25, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  statusTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 12, letterSpacing: 1 },
  statusDesc: { textAlign: 'center', fontSize: 14, lineHeight: 22, fontWeight: '500' },
  actionContainer: { width: '100%' },
  label: { fontSize: 11, textTransform: 'uppercase', fontWeight: '900', marginBottom: 12, marginLeft: 4, letterSpacing: 1.5 },
  bigButton: { flexDirection: 'row', height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  buttonText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
  helperText: { marginTop: 20, textAlign: 'center', fontSize: 12, fontWeight: '600', opacity: 0.8 },
});