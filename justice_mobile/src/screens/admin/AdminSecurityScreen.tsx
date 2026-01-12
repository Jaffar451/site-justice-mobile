import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Surface, Divider } from 'react-native-paper';
import { useQuery, useMutation } from '@tanstack/react-query'; // ✅ VRAI SYSTÈME

import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import { useAppTheme } from '../../theme/AppThemeProvider';
import { getSecurityOverview, triggerSecurityScan } from '../../services/admin.service'; // ✅ IMPORT API

export default function AdminSecurityScreen({ navigation }: any) {
  const { theme, isDark } = useAppTheme();
  
  // ✅ 1. RÉCUPÉRATION DU SCORE DE SÉCURITÉ RÉEL
  const { data: securityData, isLoading, refetch } = useQuery({
    queryKey: ['securityOverview'],
    queryFn: getSecurityOverview,
  });

  // ✅ 2. LANCEMENT D'UN SCAN RÉEL SUR LE BACKEND
  const scanMutation = useMutation({
    mutationFn: triggerSecurityScan,
    onSuccess: (data: any) => {
        Alert.alert("Rapport de Scan", `Menaces trouvées : ${data.threatsFound}\nVulnérabilités : ${data.vulnerabilities}`);
        refetch(); // Rafraîchir les données après le scan
    },
    onError: () => Alert.alert("Erreur", "Le scan n'a pas pu démarrer.")
  });

  const handleScan = () => {
    scanMutation.mutate();
  };

  const securityScore = securityData?.score || 0; // Donnée réelle ou 0 si chargement

  const colors = {
    bg: isDark ? "#0F172A" : "#F8FAFC",
    card: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#1E293B",
    sub: isDark ? "#94A3B8" : "#64748B",
    good: "#10B981",
    warning: "#F59E0B",
    bad: "#EF4444"
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Centre de Sécurité" showBack />

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.bg }]}>
        
        {/* 🛡️ SCORE HEADER (Connecté API) */}
        <View style={styles.scoreContainer}>
            <View style={[styles.scoreCircle, { borderColor: securityScore > 80 ? colors.good : colors.warning }]}>
                {isLoading ? (
                    <ActivityIndicator color={colors.text} />
                ) : (
                    <>
                        <Ionicons name="shield-checkmark" size={40} color={securityScore > 80 ? colors.good : colors.warning} />
                        <Text style={[styles.scoreText, { color: colors.text }]}>{securityScore}%</Text>
                    </>
                )}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.scoreTitle, { color: colors.text }]}>État du Système</Text>
                <Text style={[styles.scoreSub, { color: colors.sub }]}>
                    {isLoading ? "Analyse..." : `Menaces actives : ${securityData?.threats || 0}`}
                </Text>
                
                <TouchableOpacity 
                    style={[styles.scanBtn, { backgroundColor: theme.colors.primary }]} 
                    onPress={handleScan}
                    disabled={scanMutation.isPending}
                >
                    {scanMutation.isPending ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={styles.scanText}>LANCER UN SCAN COMPLET</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>

        {/* 🚨 ALERTES RÉCENTES (Données API) */}
        <Text style={[styles.sectionTitle, { color: colors.sub, marginTop: 25 }]}>DERNIÈRES MENACES</Text>
        <Surface style={[styles.card, { backgroundColor: colors.card }]} elevation={2}>
            {securityData?.alerts && securityData.alerts.length > 0 ? (
                securityData.alerts.map((alert: any, index: number) => (
                    <View key={index}>
                        <View style={styles.alertRow}>
                            <Ionicons name="warning" size={20} color={colors.bad} />
                            <View style={{flex: 1, marginLeft: 10}}>
                                <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.title}</Text>
                                <Text style={[styles.alertTime, { color: colors.sub }]}>{alert.time} • IP: {alert.ip}</Text>
                            </View>
                        </View>
                        <Divider />
                    </View>
                ))
            ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle" size={40} color={colors.good} />
                    <Text style={{ color: colors.sub, marginTop: 10 }}>Aucune menace détectée.</Text>
                </View>
            )}
        </Surface>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  scoreContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, gap: 20 },
  scoreCircle: { 
      width: 90, height: 90, borderRadius: 45, borderWidth: 4, 
      justifyContent: 'center', alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.02)' 
  },
  scoreText: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  scoreTitle: { fontSize: 18, fontWeight: '900' },
  scoreSub: { fontSize: 12, marginBottom: 10 },
  scanBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'flex-start', minWidth: 150, alignItems: 'center' },
  scanText: { color: 'white', fontWeight: 'bold', fontSize: 11 },

  sectionTitle: { fontSize: 11, fontWeight: '900', marginBottom: 10, marginLeft: 5, opacity: 0.7 },
  card: { borderRadius: 16, overflow: 'hidden' },
  
  alertRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  alertTitle: { fontSize: 13, fontWeight: '700' },
  alertTime: { fontSize: 11 },
});