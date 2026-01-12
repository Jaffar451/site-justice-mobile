import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text, Button, TextInput, Surface, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from "@tanstack/react-query";

// ✅ Architecture
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import { useAppTheme } from '../../theme/AppThemeProvider';
import { useAuthStore } from '../../stores/useAuthStore';
import api from '../../services/api'; 

// --- SERVICE LOCAL (Simulation) ---
const fetchUnitStats = async (role: string | undefined, unitId: string | undefined) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        processedCases: Math.floor(Math.random() * 20) + 5, 
        pendingCases: Math.floor(Math.random() * 10),      
        incidents: Math.floor(Math.random() * 3),          
      });
    }, 1000);
  });
};

export default function WeeklyReportScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  
  // ✅ CORRECTION 1 : Gestion des rôles spécifiques
  // On cast 'as string' pour éviter l'erreur de type strict si l'enum n'est pas parfait
  const userRole = user?.role as string; 
  
  // Logique d'affichage selon le type d'unité
  let userRoleLabel = 'Service';
  if (['officier_police', 'commissaire', 'gendarme', 'opj'].includes(userRole)) {
    userRoleLabel = 'Commissariat';
  } else if (['judge', 'prosecutor', 'clerk'].includes(userRole)) {
    userRoleLabel = 'Cabinet / Greffe';
  }

  const userUnit = (user as any)?.district || "Unité Centrale";

  // 2. Récupération des stats
  const { data: weekStats, isLoading } = useQuery({
    queryKey: ['weekly-unit-stats', user?.id],
    queryFn: () => fetchUnitStats(userRole, (user as any)?.unitId),
  });

  const [report, setReport] = useState({
    week: `Semaine du ${new Date().toLocaleDateString('fr-FR')}`,
    unit: `${userRoleLabel} - ${userUnit}`,
    activities: '',
    incidents: '',
    needs: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (weekStats && !report.activities) {
        const suggestion = `Total dossiers traités : ${(weekStats as any).processedCases}. \nDossiers en attente : ${(weekStats as any).pendingCases}.`;
        setReport(prev => ({ ...prev, activities: suggestion }));
    }
  }, [weekStats]);

  const handleSubmit = async () => {
    if (!report.activities.trim()) {
      Alert.alert("Incomplet", "Veuillez au moins décrire les activités réalisées.");
      return;
    }

    setSubmitting(true);
    
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        "Rapport Transmis 🚀", 
        `Votre rapport pour ${userUnit} a été archivé et transmis à la hiérarchie.`,
        [{ text: "Retour", onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };

  return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Rapport d'Activité" showBack />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          
          {/* 📊 BLOC STATISTIQUES AUTOMATIQUES */}
          <Surface style={[styles.statsCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <View style={styles.statsHeader}>
                <Ionicons name="stats-chart" size={20} color={theme.colors.primary} />
                <Text style={[styles.statsTitle, { color: theme.colors.primary }]}>
                    Données Automatiques : {userUnit}
                </Text>
            </View>
            <Divider style={{ marginVertical: 10 }} />
            
            {isLoading ? (
                <ActivityIndicator color={theme.colors.primary} />
            ) : (
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{(weekStats as any)?.processedCases}</Text>
                        <Text style={styles.statLabel}>Traités</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{(weekStats as any)?.pendingCases}</Text>
                        <Text style={styles.statLabel}>En cours</Text>
                    </View>
                    <View style={styles.statItem}>
                        {/* ✅ CORRECTION 2 : Utilisation de theme.colors.danger */}
                        <Text style={[styles.statValue, { color: theme.colors.danger }]}>{(weekStats as any)?.incidents}</Text>
                        <Text style={styles.statLabel}>Alertes</Text>
                    </View>
                </View>
            )}
            <Text style={[styles.autoFillNote, { color: theme.colors.textSecondary }]}>
                * Ces chiffres sont extraits automatiquement de votre activité cette semaine.
            </Text>
          </Surface>

          {/* 📝 FORMULAIRE DE RAPPORT */}
          <Surface style={[styles.card, { backgroundColor: theme.colors.surface, marginTop: 15 }]} elevation={2}>
            
            <TextInput
              label="Unité / Service"
              value={report.unit}
              mode="outlined"
              style={styles.input}
              disabled
              left={<TextInput.Icon icon="shield-account" />}
              theme={{ colors: { disabled: theme.colors.text } }}
            />

            <TextInput
              label="Période"
              value={report.week}
              mode="outlined"
              style={styles.input}
              disabled
              left={<TextInput.Icon icon="calendar" />}
              theme={{ colors: { disabled: theme.colors.text } }}
            />

            <TextInput
              label="Synthèse des Activités"
              placeholder="Détaillez les opérations majeures..."
              value={report.activities}
              onChangeText={(t) => setReport({...report, activities: t})}
              mode="outlined"
              multiline
              numberOfLines={6}
              style={styles.textArea}
              outlineColor={theme.colors.textSecondary}
              activeOutlineColor={theme.colors.primary}
            />

            <TextInput
              label="Incidents & Difficultés"
              placeholder="Problèmes matériels, RH ou opérationnels..."
              value={report.incidents}
              onChangeText={(t) => setReport({...report, incidents: t})}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.textArea}
              outlineColor={theme.colors.textSecondary}
              // ✅ CORRECTION 3 : Utilisation de theme.colors.danger
              activeOutlineColor={theme.colors.danger}
            />

            <TextInput
              label="Besoins Logistiques"
              placeholder="Demandes de matériel ou renforts..."
              value={report.needs}
              onChangeText={(t) => setReport({...report, needs: t})}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.textArea}
              outlineColor={theme.colors.textSecondary}
              activeOutlineColor={theme.colors.primary}
            />

            <Button 
              mode="contained" 
              onPress={handleSubmit} 
              loading={submitting}
              disabled={submitting}
              style={[styles.btn, { backgroundColor: theme.colors.primary }]}
              contentStyle={{ height: 50 }}
              labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
              icon="send"
            >
              TRANSMETTRE
            </Button>
          </Surface>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  statsCard: { padding: 16, borderRadius: 16 },
  statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statsTitle: { fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 5 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: 'gray' },
  autoFillNote: { fontSize: 10, fontStyle: 'italic', marginTop: 10, textAlign: 'center' },
  card: { padding: 20, borderRadius: 16 },
  input: { marginBottom: 15, backgroundColor: 'white' },
  textArea: { marginBottom: 15, backgroundColor: 'white', textAlignVertical: 'top' },
  btn: { marginTop: 10, borderRadius: 12 }
});