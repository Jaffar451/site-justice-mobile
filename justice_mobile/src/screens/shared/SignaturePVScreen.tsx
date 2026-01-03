import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, StatusBar } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// ✅ Imports Architecture Alignés
import { useAuthStore } from '../../stores/useAuthStore';
import { getAppTheme } from '../../theme';
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';
import { SignaturePad } from '../../components/SignaturePad';

// Services
import { updateComplaint } from '../../services/complaint.service';

export default function SignaturePVScreen({ route, navigation }: any) {
  const theme = getAppTheme();
  const { user } = useAuthStore();
  
  // Récupération sécurisée des paramètres
  const params = route.params || {};
  const complaintId = params.complaintId || 'REF-PENDING';
  
  const [signatureBase64, setSignatureBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveSignature = (base64: string) => {
    setSignatureBase64(base64);
    Toast.show({
      type: 'success',
      text1: 'Signature capturée ✅',
      text2: 'L\'empreinte numérique a été générée.',
    });
  };

  const handleFinalize = async () => {
    if (!signatureBase64) {
      Alert.alert("Action requise", "Veuillez apposer votre signature dans le cadre ci-dessous.");
      return;
    }

    Alert.alert(
      "Clôture du Procès-Verbal",
      "En signant ce document, vous certifiez l'exactitude des faits. Le dossier sera immédiatement transmis au Parquet de la République.",
      [
        { text: "Relire", style: "cancel" },
        { 
          text: "Signer & Transmettre", 
          onPress: async () => {
            try {
              setIsSubmitting(true);
              
              // Mise à jour du statut dans le registre central
              await updateComplaint(complaintId, {
                status: user?.role === 'police' ? 'transmise_parquet' : 'attente_validation',
                signatureData: signatureBase64,
                signedAt: new Date().toISOString()
              } as any);

              Toast.show({
                type: 'success',
                text1: 'Dossier Scellé ⚖️',
                text2: 'Le PV a été versé au registre national.',
              });
              
              navigation.navigate('Home');
            } catch (error) {
              Alert.alert("Erreur de liaison", "Impossible de sceller le document. Vérifiez votre connexion internet.");
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Certification de l'Acte" showBack={true} />

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollPadding}
      >
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: theme.color }]}>Signature Électronique</Text>
          <Text style={styles.subtitle}>Dossier Référence : {complaintId}</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.noticeBox}>
              <Ionicons name="information-circle-outline" size={20} color={theme.color} />
              <Text style={styles.infoTitle}>Engagement Juridique</Text>
            </View>
            
            <Text style={styles.infoText}>
              "Je soussigné, certifie que les déclarations consignées dans ce procès-verbal sont l'expression exacte de la vérité."
            </Text>
            
            <Divider style={styles.divider} />
            
            <View style={styles.padWrapper}>
              <SignaturePad 
                description="Signez à l'intérieur du cadre"
                onOK={handleSaveSignature}
                penColor={theme.color}
              />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.warningBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#B91C1C" />
          <Text style={styles.warningText}>
            Toute fausse déclaration expose son auteur aux peines prévues par le Code Pénal du Niger.
          </Text>
        </View>

        <Button 
          mode="contained" 
          onPress={handleFinalize}
          style={[styles.mainBtn, { backgroundColor: theme.color }]}
          contentStyle={styles.btnContent}
          loading={isSubmitting}
          disabled={!signatureBase64 || isSubmitting}
          labelStyle={styles.btnLabel}
        >
          SCELLER ET TRANSMETTRE AU PARQUET
        </Button>
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollPadding: { padding: 20, paddingBottom: 120 },
  headerInfo: { marginBottom: 25 },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 5, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#64748B', fontWeight: '700' },
  
  card: { borderRadius: 24, backgroundColor: '#FFF', elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  noticeBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  infoTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  infoText: { fontSize: 14, lineHeight: 22, color: '#475569', fontStyle: 'italic', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12 },
  divider: { marginVertical: 20, height: 1, backgroundColor: '#F1F5F9' },
  
  padWrapper: { minHeight: 250 },
  
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 25, paddingHorizontal: 10 },
  warningText: { flex: 1, fontSize: 11, color: '#B91C1C', fontWeight: '700', lineHeight: 16 },
  
  mainBtn: { marginTop: 30, borderRadius: 16, elevation: 5 },
  btnContent: { height: 64 },
  btnLabel: { fontWeight: '900', fontSize: 14, letterSpacing: 0.5 }
});