// PATH: src/screens/police/CreateSummonScreen.tsx
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
import { createSummon, Summon } from '../../services/summon.service';
import { useAppTheme } from "../../theme/AppThemeProvider"; 
import { PoliceScreenProps } from "../../types/navigation";

export default function CreateSummonScreen({ route, navigation }: PoliceScreenProps<'CreateSummon'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  // ✅ Extraction typée des paramètres de navigation
  const complaintId = route.params?.complaintId;
  
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
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {
      setForm({ ...form, scheduledAt: selectedDate });
    }
  };

  const handleSubmit = async () => {
    // 🛡️ Sécurité : Vérification de l'existence du dossier source
    if (!complaintId) {
      return Alert.alert("Erreur", "Identifiant du dossier manquant. Impossible d'émettre l'acte.");
    }

    if (!isFormValid) {
      return Alert.alert("Champs requis", "Veuillez renseigner au moins le nom du convoqué et le lieu.");
    }

    Alert.alert(
      "Émission d'acte judiciaire ⚖️",
      `Confirmez-vous la génération de cette convocation pour ${form.targetName} ?`,
      [
        { text: "Réviser", style: "cancel" },
        { 
          text: "Signer et Envoyer", 
          onPress: async () => {
            setLoading(true);
            try {
              // ✅ Préparation de l'objet Summon selon l'interface du service
              const summonData: Summon = {
                complaintId: Number(complaintId),
                targetName: form.targetName,
                targetPhone: form.targetPhone,
                location: form.location,
                scheduledAt: form.scheduledAt.toISOString(),
                reason: form.reason
              };

              await createSummon(summonData);
              
              Alert.alert(
                "Acte Validé ✅", 
                "La convocation est désormais versée au dossier et sera notifiée au destinataire."
              );
              navigation.goBack();
            } catch (error) {
              Alert.alert("Erreur de synchronisation", "L'acte a été généré localement mais n'a pas pu être transmis au serveur central.");
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
      <AppHeader title="Nouvelle Convocation" showBack />
      
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
            {/* 🛡️ BANDEAU DE RESPONSABILITÉ JURIDIQUE */}
            <View style={[styles.infoBox, { backgroundColor: isDark ? "#1E1B4B" : "#E3F2FD" }]}>
              <Ionicons name="information-circle" size={24} color={primaryColor} />
              <Text style={[styles.infoText, { color: isDark ? "#BAE6FD" : "#1E3A8A" }]}>
                La convocation est un acte d'instruction. Elle oblige la personne à se présenter sous peine de mandat d'amener.
              </Text>
            </View>

            <Surface style={[styles.formCard, { backgroundColor: colors.bgCard }]} elevation={2}>
              <Text style={[styles.sectionTitle, { color: primaryColor }]}>Partie Convoquée</Text>
              
              <TextInput 
                label="Nom et Prénom" 
                mode="outlined"
                value={form.targetName} 
                onChangeText={t => setForm({...form, targetName: t})} 
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                outlineColor={colors.border}
                activeOutlineColor={primaryColor}
                textColor={colors.textMain}
                left={<TextInput.Icon icon="account-search" />}
              />

              <TextInput 
                label="Contact Téléphonique" 
                mode="outlined"
                keyboardType="phone-pad" 
                value={form.targetPhone} 
                onChangeText={t => setForm({...form, targetPhone: t})} 
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                outlineColor={colors.border}
                activeOutlineColor={primaryColor}
                textColor={colors.textMain}
                left={<TextInput.Icon icon="phone-outgoing" />}
              />

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <Text style={[styles.sectionTitle, { color: primaryColor }]}>Détails de l'Audition</Text>

              <TextInput 
                label="Lieu du rendez-vous" 
                mode="outlined"
                value={form.location} 
                onChangeText={t => setForm({...form, location: t})} 
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                outlineColor={colors.border}
                activeOutlineColor={primaryColor}
                textColor={colors.textMain}
                left={<TextInput.Icon icon="map-marker-radius" />}
              />

              <TouchableOpacity 
                 activeOpacity={0.7} 
                 onPress={() => setShowDatePicker(true)}
                 style={[styles.datePickerBtn, { borderColor: colors.border }]}
              >
                <View style={[styles.dateIcon, { backgroundColor: primaryColor + '15' }]}>
                  <Ionicons name="time" size={20} color={primaryColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dateLabel}>Date et Heure</Text>
                  <Text style={[styles.dateValue, { color: colors.textMain }]}>
                    {format(form.scheduledAt, "eeee dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </Text>
                </View>
                <Ionicons name="calendar-outline" size={18} color={colors.textSub} />
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
                label="Motif de la convocation" 
                mode="outlined"
                multiline 
                numberOfLines={3} 
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
              style={[styles.btn, { backgroundColor: primaryColor }]}
              contentStyle={styles.btnContent}
              labelStyle={styles.btnLabel}
            >
              ÉMETTRE LA CONVOCATION
            </Button>
            
            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 60 },
  infoBox: { flexDirection: 'row', padding: 16, borderRadius: 16, marginBottom: 20, alignItems: 'center', gap: 12 },
  infoText: { flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 18 },
  formCard: { padding: 20, borderRadius: 20, marginBottom: 25 },
  sectionTitle: { fontSize: 13, fontWeight: "900", marginBottom: 18, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { marginBottom: 16 },
  textArea: { marginBottom: 4, minHeight: 80 },
  divider: { height: 1, marginVertical: 20, opacity: 0.1 },
  datePickerBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16, gap: 12 },
  dateIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  dateLabel: { fontSize: 10, fontWeight: "800", color: '#94A3B8', textTransform: 'uppercase' },
  dateValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  btn: { borderRadius: 14, elevation: 2 },
  btnContent: { height: 56 },
  btnLabel: { fontWeight: '900', fontSize: 14 }
});