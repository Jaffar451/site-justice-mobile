import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  StatusBar, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// ✅ Architecture & Services
import { useAppTheme } from '../../theme/AppThemeProvider';
import api from '../../services/api'; // Votre instance Axios
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';

// --- TYPES ---
interface ComplaintDetail {
  id: number;
  trackingCode: string;
  title: string;
  description: string;
  createdAt: string;
  filedAt: string;
  status: string;
  policeStation?: { name: string; city: string };
  officer?: { firstname: string; lastname: string; rank: string };
  // Simulation des pièces jointes si pas encore en back
  attachmentsCount?: number; 
}

// --- SERVICES API ---
const fetchComplaintDetail = async (id: number): Promise<ComplaintDetail> => {
  const { data } = await api.get(`/complaints/${id}`);
  return data;
};

const transmitToParquet = async (id: number) => {
  // Endpoint hypothétique pour valider et transmettre
  // Adaptez selon votre route back (ex: PATCH /complaints/:id/status)
  const { data } = await api.post(`/complaints/${id}/transmit`, {
    visa: true,
    destination: "Parquet Instance Niamey"
  });
  return data;
};

export default function CommissaireActionDetail() {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const navigation = useNavigation<any>();
  const route = useRoute();
  const queryClient = useQueryClient();
  
  // 1️⃣ Récupération de l'ID depuis la navigation
  const params = route.params as { id: number };
  const dossierId = params?.id;

  // 2️⃣ Récupération des données (Lecture)
  const { data: dossier, isLoading, isError } = useQuery({
    queryKey: ['complaint-detail', dossierId],
    queryFn: () => fetchComplaintDetail(dossierId),
    enabled: !!dossierId, // Ne lance pas si pas d'ID
  });

  // 3️⃣ Mutation (Action d'écriture : Transmettre)
  const mutation = useMutation({
    mutationFn: () => transmitToParquet(dossierId),
    onSuccess: () => {
      // Invalide les listes pour forcer le rafraîchissement au retour
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['command-center-data'] });

      Toast.show({
        type: 'success',
        text1: 'Visa Apposé ✅',
        text2: 'Dossier transmis au Parquet avec succès.',
      });
      
      // Retour au Dashboard
      navigation.popToTop();
    },
    onError: (error: any) => {
      Alert.alert("Échec Transmission", error?.response?.data?.message || "Erreur de connexion serveur.");
    }
  });

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#F1F5F9",
  };

  const handleVisaAndTransmit = () => {
    if (!dossier) return;

    const title = "Visa Institutionnel";
    const msg = `En validant, vous apposez votre signature numérique sur le dossier ${dossier.trackingCode} et ordonnez sa transmission au Procureur.`;

    if (Platform.OS === 'web') {
        if (window.confirm(`${title} : ${msg}`)) mutation.mutate();
    } else {
        Alert.alert(title, msg, [
          { text: "Relire", style: "cancel" },
          { text: "Viser et Envoyer", onPress: () => mutation.mutate() }
        ]);
    }
  };

  // --- RENDU : CHARGEMENT ---
  if (isLoading) {
    return (
      <ScreenContainer withPadding={false}>
        <AppHeader title="Chargement..." showBack />
        <View style={styles.center}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={{ marginTop: 10, color: colors.textSub }}>Récupération du dossier...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // --- RENDU : ERREUR ---
  if (isError || !dossier) {
    return (
        <ScreenContainer withPadding={false}>
          <AppHeader title="Erreur" showBack />
          <View style={styles.center}>
              <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
              <Text style={{ marginTop: 10, color: colors.textMain }}>Dossier introuvable.</Text>
              <TouchableOpacity style={{marginTop:20}} onPress={() => navigation.goBack()}>
                  <Text style={{color: primaryColor, fontWeight:'bold'}}>Retour</Text>
              </TouchableOpacity>
          </View>
        </ScreenContainer>
      );
  }

  // --- RENDU : PRINCIPAL ---
  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title={`Révision #${dossier.trackingCode || dossier.id}`} showBack />

      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* 📑 RÉSUMÉ DE LA PROCÉDURE */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>SYNTHÈSE DE L'OPJ RAPPORTEUR</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
             
             {/* Ligne OPJ */}
             <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSub }]}>OPJ :</Text>
                <Text style={[styles.infoValue, { color: colors.textMain }]}>
                    {dossier.officer ? `${dossier.officer.rank || 'Agent'} ${dossier.officer.lastname}` : 'Non assigné'}
                </Text>
             </View>

             {/* Ligne Unité */}
             <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSub }]}>Unité :</Text>
                <Text style={[styles.infoValue, { color: colors.textMain }]}>
                    {dossier.policeStation?.name || "Commissariat Central"}
                </Text>
             </View>

             <View style={[styles.divider, { backgroundColor: colors.border }]} />
             
             {/* Corps du résumé */}
             <Text style={[styles.resumeHeader, { color: primaryColor }]}>{dossier.title}</Text>
             <Text style={[styles.resumeText, { color: isDark ? "#CBD5E1" : "#475569" }]}>
                {dossier.description || "Aucune description fournie par l'enquêteur."}
             </Text>
          </View>
        </View>

        {/* 📄 VISUALISATION DES PIÈCES */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>
            ACTES ET PROCÈS-VERBAUX ({dossier.attachmentsCount || 1})
          </Text>
          <TouchableOpacity 
            style={[styles.pdfPreview, { backgroundColor: colors.bgCard, borderColor: colors.border }]} 
            activeOpacity={0.7}
            onPress={() => Alert.alert("Lecture PDF", "Ouverture du visualiseur sécurisé...")}
          >
            <View style={[styles.pdfIconBox, { backgroundColor: isDark ? "#450A0A" : "#FEF2F2" }]}>
              <Ionicons name="document-text" size={28} color="#EF4444" />
            </View>
            <View style={{flex: 1, marginLeft: 12}}>
               <Text style={[styles.pdfName, { color: colors.textMain }]} numberOfLines={1}>PV_SYNTHESE_FINAL.pdf</Text>
               <Text style={[styles.pdfSize, { color: colors.textSub }]}>Généré le {new Date().toLocaleDateString()}</Text>
            </View>
            <Ionicons name="eye-outline" size={22} color={primaryColor} />
          </TouchableOpacity>
        </View>

        {/* ⚖️ ORIENTATION JUDICIAIRE */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>DESTINATION DE L'ACTE</Text>
          <View style={[styles.destinationCard, { backgroundColor: colors.bgCard, borderColor: primaryColor + '40' }]}>
             <View style={[styles.destIcon, { backgroundColor: primaryColor + '15' }]}>
                <Ionicons name="business" size={22} color={primaryColor} />
             </View>
             <View>
                <Text style={[styles.destLabel, { color: colors.textSub }]}>Parquet de destination :</Text>
                <Text style={[styles.destinationText, { color: colors.textMain }]}>Tribunal de Grande Instance</Text>
             </View>
          </View>
        </View>

        {/* 🛠️ BOUTONS D'ACTION */}
        <View style={styles.actionContainer}>
           <TouchableOpacity 
             style={[styles.mainBtn, { backgroundColor: primaryColor, opacity: mutation.isPending ? 0.7 : 1 }]} 
             onPress={handleVisaAndTransmit}
             disabled={mutation.isPending}
           >
             {mutation.isPending ? (
               <ActivityIndicator color="#FFF" />
             ) : (
               <>
                 <Ionicons name="shield-checkmark" size={22} color="#FFF" />
                 <Text style={styles.btnText}>APPOSER LE VISA ET TRANSMETTRE</Text>
               </>
             )}
           </TouchableOpacity>

           <TouchableOpacity 
             style={[styles.secondaryBtn, { borderColor: isDark ? "#450A0A" : "#FEE2E2" }]} 
             onPress={() => navigation.goBack()}
             disabled={mutation.isPending}
           >
              <Ionicons name="arrow-undo" size={20} color="#EF4444" />
              <Text style={styles.secondaryBtnText}>RETOUR À L'OPJ POUR COMPLÉMENT</Text>
           </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 20, paddingBottom: 60 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12, textTransform: 'uppercase' },
  card: { padding: 20, borderRadius: 24, borderWidth: 1, ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 2 } }) },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  infoLabel: { fontSize: 13, fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '800' },
  divider: { height: 1, marginVertical: 12 },
  resumeHeader: { fontSize: 16, fontWeight: '900', marginBottom: 8 },
  resumeText: { fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  
  pdfPreview: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, borderWidth: 1 },
  pdfIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  pdfName: { fontSize: 14, fontWeight: '800' },
  pdfSize: { fontSize: 11, marginTop: 2 },
  
  destinationCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, borderWidth: 1.5, gap: 15 },
  destIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  destLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  destinationText: { fontSize: 15, fontWeight: '900' },
  
  actionContainer: { marginTop: 10, gap: 15 },
  mainBtn: { height: 68, borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10 }, android: { elevation: 4 } }) },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  secondaryBtn: { height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5 },
  secondaryBtnText: { color: '#EF4444', fontWeight: '900', fontSize: 12 }
});