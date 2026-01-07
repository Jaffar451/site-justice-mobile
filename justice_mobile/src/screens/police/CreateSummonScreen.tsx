import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Platform, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  StatusBar
} from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from "@expo/vector-icons";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ✅ Logic & Architecture
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';
import { createSummon } from '../../services/summon.service';
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Utilisation du hook dynamique
import { PoliceScreenProps } from "../../types/navigation";

export default function CreateSummonScreen({ route, navigation }: PoliceScreenProps<'CreateSummon'>) {
  // ✅ Thème & Auth alignés
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  // Récupération sécurisée du complaintId
  const params = route.params as any;
  const complaintId = params?.complaintId || params?.caseId;
  
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [form, setForm] = useState({
    targetName: '',
    targetPhone: '',
    location: '',
    scheduledAt: new Date(),
    reason: ''
  });

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
  };

  const isFormValid = form.targetName.trim().length > 2 && form.location.trim().length > 2;

  const onChangeDate = (event: any, selectedDate?: Date) => {
    // Sur Android, on ferme le picker immédiatement après sélection
    if (Platform.OS === 'android') setShowDatePicker(false);
    
    if (selectedDate) {
      setForm({ ...form, scheduledAt: selectedDate });
    }
  };

  const handleSubmit = async () => {
    if (!complaintId || complaintId === 'undefined') {
      return Alert.alert("Erreur", "Identifiant du dossier corrompu.");
    }

    if (!isFormValid) {
      return Alert.alert("Données manquantes", "Veuillez renseigner le nom et le lieu.");
    }

    Alert.alert(
      "Émission de Convocation ⚖️",
      `Confirmez-vous l'envoi de cet acte officiel à ${form.targetName} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Générer l'Acte", 
          onPress: async () => {
            setLoading(true);
            try {
              // ✅ Envoi avec Number() pour la stabilité DB
              await createSummon({ 
                ...form, 
                complaintId: Number(complaintId),
                scheduledAt: form.scheduledAt.toISOString() 
              });
              Alert.alert("Acte Scellé ✅", "La convocation a été générée et versée au dossier.");
              navigation.goBack();
            } catch (error) {
              Alert.alert("Échec Système", "Impossible de synchroniser l'acte avec le serveur central.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Émettre une Convocation" showBack />
      
      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            
            {/* 🛡️ BANDEAU DE RESPONSABILITÉ */}
            <View style={[styles.infoBox, { backgroundColor: isDark ? "#1E1B4B" : "#E3F2FD" }]}>
              <Ionicons name="shield-checkmark" size={24} color={primaryColor} />
              <Text style={[styles.infoText, { color: isDark ? "#BAE6FD" : "#1E3A8A" }]}>
                Cet acte d'instruction engage la responsabilité juridique de l'OPJ signataire.
              </Text>
            </View>

            <Surface style={[styles.formCard, { backgroundColor: colors.bgCard }]} elevation={2}>
              <Text style={[styles.sectionTitle, { color: primaryColor }]}>Destinataire de l'acte</Text>
              
              <TextInput 
                label="Nom Complet du Convoqué" 
                mode="outlined"
                value={form.targetName} 
                onChangeText={t => setForm({...form, targetName: t})} 
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                outlineColor={colors.border}
                activeOutlineColor={primaryColor}
                textColor={colors.textMain}
                left={<TextInput.Icon icon="account-tie" />}
              />

              <TextInput 
                label="Numéro de Téléphone" 
                mode="outlined"
                keyboardType="phone-pad" 
                value={form.targetPhone} 
                onChangeText={t => setForm({...form, targetPhone: t})} 
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                outlineColor={colors.border}
                activeOutlineColor={primaryColor}
                textColor={colors.textMain}
                left={<TextInput.Icon icon="phone" />}
              />

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <Text style={[styles.sectionTitle, { color: primaryColor }]}>Logistique de l'Audition</Text>

              <TextInput 
                label="Lieu (Bureau / Commissariat)" 
                mode="outlined"
                value={form.location} 
                onChangeText={t => setForm({...form, location: t})} 
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                outlineColor={colors.border}
                activeOutlineColor={primaryColor}
                textColor={colors.textMain}
                left={<TextInput.Icon icon="map-marker" />}
              />

              <TouchableOpacity 
                 activeOpacity={0.7} 
                 onPress={() => setShowDatePicker(true)}
                 style={[styles.datePickerBtn, { borderColor: colors.border }]}
              >
                <View style={[styles.dateIcon, { backgroundColor: primaryColor + '15' }]}>
                  <Ionicons name="calendar" size={20} color={primaryColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dateLabel}>Date et Heure fixées</Text>
                  <Text style={[styles.dateValue, { color: colors.textMain }]}>
                    {format(form.scheduledAt, "eeee dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={form.scheduledAt}
                  mode="datetime"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeDate}
                  minimumDate={new Date()}
                />
              )}

              <TextInput 
                label="Motif légal de la convocation" 
                mode="outlined"
                multiline 
                numberOfLines={4} 
                value={form.reason} 
                onChangeText={t => setForm({...form, reason: t})} 
                style={[styles.textArea, { backgroundColor: colors.inputBg }]} 
                outlineColor={colors.border}
                activeOutlineColor={primaryColor}
                textColor={colors.textMain}
              />
            </Surface>

            <Button 
              mode="contained" 
              onPress={handleSubmit} 
              loading={loading} 
              disabled={loading || !isFormValid}
              style={[styles.btn, { backgroundColor: primaryColor, opacity: loading ? 0.7 : 1 }]}
              contentStyle={styles.btnContent}
              icon="file-document-edit"
            >
              SIGNER ET GÉNÉRER L'ACTE
            </Button>
            
            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 100 },
  infoBox: { flexDirection: 'row', padding: 16, borderRadius: 16, marginBottom: 20, alignItems: 'center', gap: 12 },
  infoText: { flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 18 },
  formCard: { padding: 20, borderRadius: 24, marginBottom: 25 },
  sectionTitle: { fontSize: 13, fontWeight: "900", marginBottom: 18, textTransform: 'uppercase', letterSpacing: 1 },
  input: { marginBottom: 16 },
  textArea: { marginBottom: 4, minHeight: 100 },
  divider: { height: 1, marginVertical: 20, opacity: 0.2 },
  datePickerBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1.5, marginBottom: 16, gap: 12 },
  dateIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  dateLabel: { fontSize: 10, fontWeight: "800", color: '#94A3B8', textTransform: 'uppercase' },
  dateValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  btn: { borderRadius: 18, elevation: 4, marginTop: 10 },
  btnContent: { height: 60 }
});