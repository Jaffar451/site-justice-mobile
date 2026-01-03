import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

// ✅ Logic & Theme
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import { useAuthStore } from '../../stores/useAuthStore';
import { getComplaintById, updateComplaintStatus, validateToParquet } from '../../services/complaint.service';
import { getAppTheme } from '../../theme';

export default function ComplaintDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { id } = route.params as { id: number };
  
  const { role } = useAuthStore();
  const theme = getAppTheme();

  // 1. Chargement des données
  const { data: complaint, isLoading } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => getComplaintById(id),
  });

  // 2. Mutation pour les actes de procédure
  const mutation = useMutation({
    mutationFn: (data: { status: string, extra?: any }) => updateComplaintStatus(id, data.status, data.extra),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
      Alert.alert("Acte Validé", "Le registre numérique a été mis à jour avec succès.");
    },
    onError: () => Alert.alert("Erreur", "La liaison avec le serveur central a échoué.")
  });

  if (isLoading) return (
    <ScreenContainer>
      <ActivityIndicator size="large" color={theme.color} style={styles.center} />
    </ScreenContainer>
  );

  if (!complaint) return (
    <ScreenContainer>
      <View style={styles.center}><Text>Dossier introuvable ou archivé.</Text></View>
    </ScreenContainer>
  );

  /**
   * ⚖️ ACTIONS DE PROCÉDURE PAR RÔLE
   */
  const renderActions = () => {
    switch (role) {
      case 'police':
        if (complaint.status === 'soumise') return (
          <ActionButton 
            label="Ouvrir l'enquête (Acte OPJ)" 
            icon="hammer-outline" 
            color={theme.color} 
            onPress={() => mutation.mutate({ status: 'en_cours_OPJ' })} 
          />
        );
        break;

      case 'commisaire':
        if (complaint.status === 'attente_validation') return (
          <ActionButton 
            label="Signer et Transmettre au Parquet" 
            icon="document-text-outline" 
            color="#1E3A8A" 
            onPress={() => Alert.alert("Validation", "Confirmez-vous le visa du dossier ?", [
              { text: "Annuler" },
              { text: "Viser", onPress: () => validateToParquet(id) }
            ])} 
          />
        );
        break;

      case 'prosecutor':
        if (complaint.status === 'transmise_parquet') return (
          <View style={styles.actionGrid}>
            <ActionButton label="Désigner un Cabinet" icon="person-add-outline" color="#059669" onPress={() => {}} />
            <ActionButton label="Classement sans suite" icon="close-circle-outline" color="#EF4444" onPress={() => {}} />
          </View>
        );
        break;
    }
    return null;
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title={`RG N° ${complaint.trackingCode || id}`} showBack />
      
      <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
        
        {/* 🏷️ BANDEAU DE STATUT */}
        <View style={[styles.statusBanner, { backgroundColor: theme.color + '15' }]}>
          <Ionicons name="shield-checkmark" size={18} color={theme.color} />
          <Text style={[styles.statusLabel, { color: theme.color }]}>
            {complaint.status.toUpperCase().replace(/_/g, ' ')}
          </Text>
        </View>

        {/* 📋 CORPS DU DOSSIER */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>OBJET DU SIGNALEMENT</Text>
          <Text style={styles.title}>{complaint.title}</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.description}>{complaint.description}</Text>
          </View>

          <View style={styles.divider} />

          <InfoRow label="Catégorie Pénale" value={complaint.category} icon="bookmark-outline" />
          <InfoRow label="Lieu des Faits" value={complaint.location || 'Non précisé'} icon="location-outline" />
          <InfoRow label="Date d'Enregistrement" value={new Date(complaint.filedAt).toLocaleDateString('fr-FR')} icon="calendar-outline" />
        </View>

        {/* 🛠️ ESPACE OPÉRATIONNEL */}
        <View style={styles.actionSection}>
          <Text style={styles.instructionText}>ACTES DISPONIBLES :</Text>
          {renderActions()}
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}

// 🧩 SOUS-COMPOSANTS
const ActionButton = ({ label, icon, color, onPress }: any) => (
  <TouchableOpacity style={[styles.btn, { backgroundColor: color }]} onPress={onPress} activeOpacity={0.8}>
    <Ionicons name={icon} size={22} color="#FFF" />
    <Text style={styles.btnText}>{label}</Text>
  </TouchableOpacity>
);

const InfoRow = ({ label, value, icon }: any) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <Ionicons name={icon} size={16} color="#94A3B8" />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollPadding: { padding: 20, paddingBottom: 100 },
  statusBanner: { 
    flexDirection: 'row', 
    padding: 14, 
    borderRadius: 16, 
    marginBottom: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8
  },
  statusLabel: { fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 12 },
  descriptionBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, marginBottom: 5 },
  description: { fontSize: 15, lineHeight: 24, color: '#475569' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { fontWeight: '600', color: '#64748B', fontSize: 13 },
  infoValue: { fontWeight: '800', color: '#1E293B', fontSize: 13 },
  actionSection: { marginTop: 30 },
  instructionText: { fontSize: 11, fontWeight: '900', color: '#64748B', marginBottom: 15, textAlign: 'center' },
  btn: { height: 60, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12, elevation: 2 },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
  actionGrid: { gap: 5 }
});