import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  StatusBar,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ✅ Architecture
import { useAppTheme } from '../../theme/AppThemeProvider';
import { PoliceScreenProps } from '../../types/navigation';
import { useAuthStore } from '../../stores/useAuthStore';

// Composants
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';

// Services
import { getComplaintById, updateComplaintStatus } from '../../services/complaint.service';

export default function PoliceComplaintDetailScreen({ route, navigation }: PoliceScreenProps<'PoliceComplaintDetails'>) {
  const { theme, isDark } = useAppTheme();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // 🔵 Identité Visuelle Police
  const POLICE_BLUE = "#1E40AF"; // Bleu foncé officiel

  // Récupération de l'ID via la navigation
  const { complaintId } = route.params;

  // 1. Récupération des données
  const { data: complaint, isLoading, error } = useQuery({
    queryKey: ['complaint', complaintId],
    queryFn: () => getComplaintById(complaintId),
    retry: 1 // On ne réessaie qu'une fois si erreur 500
  });

  // 2. Mutation pour changer le statut (Prise en charge)
  const mutation = useMutation({
    mutationFn: (newStatus: string) => updateComplaintStatus(complaintId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
      queryClient.invalidateQueries({ queryKey: ['police-complaints'] }); // Rafraîchir la liste
      Alert.alert("Succès", "Le statut du dossier a été mis à jour.");
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de mettre à jour le statut.");
    }
  });

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    headerBg: isDark ? "#172554" : "#EFF6FF",
  };

  // ⚠️ Gestion de l'erreur 500 (celle de vos logs)
  if (error) {
    return (
      <ScreenContainer>
        <AppHeader title="Erreur Dossier" showBack />
        <View style={styles.center}>
          <Ionicons name="warning" size={50} color="#EF4444" />
          <Text style={[styles.errorText, { color: colors.textMain }]}>
            Impossible de charger le dossier #{complaintId}.
          </Text>
          <Text style={{color: colors.textSub, textAlign: 'center', marginTop: 10}}>
            Le serveur ne répond pas (Erreur 500). Ce dossier est peut-être corrompu.
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={{color: '#FFF', fontWeight: 'bold'}}>Retourner à la liste</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  if (isLoading || !complaint) {
    return (
      <ScreenContainer>
        <AppHeader title="Chargement..." showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={POLICE_BLUE} />
        </View>
      </ScreenContainer>
    );
  }

  // --- ACTIONS MÉTIER ---

  const handleTakeCharge = () => {
    Alert.alert(
      "Prise en charge",
      "Voulez-vous ouvrir une enquête préliminaire sur ce dossier ? Le plaignant sera notifié.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Ouvrir Enquête", onPress: () => mutation.mutate('en_cours') }
      ]
    );
  };

  const handleGenerateSummon = () => {
    navigation.navigate('CreateSummon', { complaintId: complaint.id });
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title={`Dossier N° ${complaint.id}`} showBack={true} />

      <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: colors.bgMain }}>
        
        {/* 📋 EN-TÊTE DU DOSSIER */}
        <View style={[styles.headerCard, { backgroundColor: colors.headerBg, borderColor: POLICE_BLUE }]}>
          <View style={styles.rowBetween}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{complaint.status.toUpperCase().replace('_', ' ')}</Text>
            </View>
            <Text style={[styles.date, { color: colors.textSub }]}>
              {new Date(complaint.filedAt).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <Text style={[styles.title, { color: POLICE_BLUE }]}>
            {complaint.type || "Plainte contre X"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSub }]}>
            Plaignant : {complaint.citizen ? `${complaint.citizen.lastname} ${complaint.citizen.firstname}` : "Anonyme"}
          </Text>
        </View>

        {/* 📝 DESCRIPTION DES FAITS */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>RÉCIT DES FAITS</Text>
          <Text style={[styles.description, { color: colors.textMain }]}>
            {complaint.description}
          </Text>
        </View>

        {/* 📍 ACTIONS POLICIÈRES */}
        <Text style={[styles.sectionHeader, { color: colors.textSub }]}>Procédure Policière</Text>
        
        <View style={styles.actionGrid}>
          {/* BOUTON 1 : PRENDRE EN CHARGE */}
          {complaint.status === 'nouvelle' || complaint.status === 'en_attente' ? (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: POLICE_BLUE }]}
              onPress={handleTakeCharge}
            >
              <Ionicons name="folder-open" size={24} color="#FFF" />
              <Text style={styles.actionBtnText}>OUVRIR ENQUÊTE</Text>
            </TouchableOpacity>
          ) : null}

          {/* BOUTON 2 : CONVOCATION */}
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.bgCard, borderColor: POLICE_BLUE, borderWidth: 1 }]}
            onPress={handleGenerateSummon}
          >
            <Ionicons name="mail-outline" size={24} color={POLICE_BLUE} />
            <Text style={[styles.actionBtnText, { color: POLICE_BLUE }]}>CONVOQUER</Text>
          </TouchableOpacity>

          {/* BOUTON 3 : PROCÈS-VERBAL */}
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => navigation.navigate("PolicePVScreen", { complaintId: Number(complaintId) })}
          >
            <Ionicons name="document-text-outline" size={24} color={colors.textMain} />
            <Text style={[styles.actionBtnText, { color: colors.textMain }]}>RÉDIGER PV</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  headerCard: { padding: 20, borderRadius: 20, borderWidth: 1, borderLeftWidth: 6, marginBottom: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { backgroundColor: '#DBEAFE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#1E40AF', fontSize: 10, fontWeight: '900' },
  date: { fontSize: 12, fontStyle: 'italic' },
  title: { fontSize: 18, fontWeight: '900', marginBottom: 5 },
  subtitle: { fontSize: 14, fontWeight: '600' },

  card: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 25 },
  sectionTitle: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 },
  description: { fontSize: 15, lineHeight: 24, textAlign: 'justify' },

  sectionHeader: { fontSize: 14, fontWeight: '800', marginBottom: 15, textTransform: 'uppercase' },
  actionGrid: { gap: 15 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 16, gap: 10, elevation: 2 },
  actionBtnText: { fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },

  errorText: { fontSize: 16, fontWeight: 'bold', marginTop: 15, textAlign: 'center' },
  retryBtn: { marginTop: 20, backgroundColor: '#1E40AF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 }
});