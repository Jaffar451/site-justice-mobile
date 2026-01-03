import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// ✅ Architecture
import { useAppTheme } from '../../theme/AppThemeProvider'; // Hook dynamique
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';

export default function CommissaireActionDetail() {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const navigation = useNavigation<any>();
  const route = useRoute();
  
  // Récupération sécurisée de l'ID
  const params = route.params as { id: number };
  const dossierId = params?.id || '1024';

  const [isProcessing, setIsProcessing] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#F1F5F9",
    destBg: isDark ? "#1E293B" : "#FFFFFF",
    pdfBg: isDark ? "#0F172A" : "#F8FAFC",
  };

  // 📝 Simulation de données
  const dossier = {
    id: dossierId,
    opj: "Lieutenant Salifou M.",
    unite: "Commissariat Central Niamey",
    dateCloture: "30/12/2025 à 16:45",
    resume: "Enquête pour vol en réunion avec effraction commis au quartier Plateau. Le suspect principal a reconnu les faits. Les scellés (n°42) sont inventoriés et prêts pour transfert.",
    parquetDestination: "Tribunal de Grande Instance de Niamey",
    piecesJointes: 3
  };

  const handleVisaAndTransmit = () => {
    const title = "Visa Institutionnel";
    const msg = `En validant, vous apposez votre signature numérique sur le dossier RG-${dossier.id} et ordonnez sa transmission au Procureur.`;

    const executeTransmit = async () => {
        try {
          setIsProcessing(true);
          await new Promise(resolve => setTimeout(resolve, 2000)); 
          
          Toast.show({
            type: 'success',
            text1: 'Dossier Transmis ⚖️',
            text2: 'Le Parquet a été notifié de la réception du PV.',
          });
          
          navigation.navigate('CommissaireDashboard');
        } catch (error) {
          Alert.alert("Erreur", "La liaison avec le serveur de la Justice a échoué.");
        } finally {
          setIsProcessing(false);
        }
    };

    if (Platform.OS === 'web') {
        if (window.confirm(`${title} : ${msg}`)) executeTransmit();
    } else {
        Alert.alert(title, msg, [
          { text: "Relire", style: "cancel" },
          { text: "Viser et Envoyer", onPress: executeTransmit }
        ]);
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title={`Révision RG-${dossier.id}`} showBack />

      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* 📑 RÉSUMÉ DE LA PROCÉDURE */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>SYNTHÈSE DE L'OPJ RAPPORTEUR</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
             <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSub }]}>OPJ :</Text>
                <Text style={[styles.infoValue, { color: colors.textMain }]}>{dossier.opj}</Text>
             </View>
             <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSub }]}>Unité :</Text>
                <Text style={[styles.infoValue, { color: colors.textMain }]}>{dossier.unite}</Text>
             </View>
             <View style={[styles.divider, { backgroundColor: colors.border }]} />
             <Text style={[styles.resumeText, { color: isDark ? "#CBD5E1" : "#475569" }]}>{dossier.resume}</Text>
          </View>
        </View>

        {/* 📄 VISUALISATION DES PIÈCES */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>ACTES ET PROCÈS-VERBAUX ({dossier.piecesJointes})</Text>
          <TouchableOpacity 
            style={[styles.pdfPreview, { backgroundColor: colors.bgCard, borderColor: colors.border }]} 
            activeOpacity={0.7}
          >
            <View style={[styles.pdfIconBox, { backgroundColor: isDark ? "#450A0A" : "#FEF2F2" }]}>
              <Ionicons name="document-text" size={28} color="#EF4444" />
            </View>
            <View style={{flex: 1, marginLeft: 12}}>
               <Text style={[styles.pdfName, { color: colors.textMain }]} numberOfLines={1}>PV_SYNTHESE_COMPLET.pdf</Text>
               <Text style={[styles.pdfSize, { color: colors.textSub }]}>Signé numériquement par l'OPJ</Text>
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
                <Text style={[styles.destinationText, { color: colors.textMain }]}>{dossier.parquetDestination}</Text>
             </View>
          </View>
        </View>

        {/* 🛠️ BOUTONS D'ACTION */}
        <View style={styles.actionContainer}>
           <TouchableOpacity 
             style={[styles.mainBtn, { backgroundColor: primaryColor }]} 
             onPress={handleVisaAndTransmit}
             disabled={isProcessing}
           >
             {isProcessing ? (
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
             disabled={isProcessing}
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
  content: { padding: 20, paddingBottom: 60 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12, textTransform: 'uppercase' },
  card: { padding: 20, borderRadius: 24, borderWidth: 1, ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 2 } }) },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  infoLabel: { fontSize: 13, fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '800' },
  divider: { height: 1, marginVertical: 12 },
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