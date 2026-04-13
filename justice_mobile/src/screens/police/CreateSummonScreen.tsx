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
  StatusBar,
  Keyboard
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
  
  // ✅ Extraction typée
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

  // ✅ Validation (3 caractères min pour éviter les erreurs de saisie vide)
  const isFormValid = form.targetName.trim().length >= 3 && form.location.trim().length >= 3;

  // 🛠️ FIX: Gestion hybride Web/Mobile pour le DatePicker
  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setForm({ ...form, scheduledAt: selectedDate });
    }
  };

  // 🛠️ FIX: Validation et Envoi
  const handleSubmit = async () => {
    // Ferme le clavier pour éviter les bugs de focus sur Web
    Keyboard.dismiss();

    const cleanId = Number(complaintId);
    if (!cleanId || isNaN(cleanId)) {
      return Alert.alert("Erreur", "Identifiant du dossier invalide.");
    }

    if (!isFormValid) {
      return Alert.alert("Champs requis", "Veuillez renseigner le nom et le lieu.");
    }

    Alert.alert(
      "Émission d'acte ⚖️",
      `Confirmez-vous la convocation pour ${form.targetName} ?`,
      [
        { text: "Réviser", style: "cancel" },
        { 
          text: "Signer et Envoyer", 
          onPress: async () => {
            setLoading(true);
            try {
              const summonData: Summon = {
                complaintId: cleanId,
                targetName: form.targetName,
                targetPhone: form.targetPhone,
                location: form.location,
                scheduledAt: form.scheduledAt.toISOString(),
                reason: form.reason
              };

              await createSummon(summonData);
              
              Alert.alert("Succès ✅", "Convocation enregistrée.");
              navigation.goBack();
            } catch (error) {
              Alert.alert("Erreur", "Impossible de joindre le serveur.");
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
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.infoBox, { backgroundColor: isDark ? "#1E1B4B" : "#E3F2FD" }]}>
              <Ionicons name="information-circle" size={24} color={primaryColor} />
              <Text style={[styles.infoText, { color: isDark ? "#BAE6FD" : "#1E3A8A" }]}>
                Acte d'instruction : oblige la personne à se présenter sous peine de mandat.
              </Text>
            </View>

            <Surface style={[styles.formCard, { backgroundColor: colors.bgCard }]} elevation={2}>
              <Text style={[styles.sectionTitle, { color: primaryColor }]}>Destinataire</Text>
              
              <TextInput 
                label="Nom et Prénom" 
                mode="outlined"
                value={form.targetName} 
                onChangeText={t => setForm({...form, targetName: t})} 
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                outlineColor={colors.border}
                activeOutlineColor={primaryColor}
                left={<TextInput.Icon icon="account-tie" />}
              />

              <TextInput 
                label="Téléphone" 
                mode="outlined"
                keyboardType="phone-pad" 
                value={form.targetPhone} 
                onChangeText={t => setForm({...form, targetPhone: t})} 
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                outlineColor={colors.border}
                left={<TextInput.Icon icon="phone" />}
              />

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <Text style={[styles.sectionTitle, { color: primaryColor }]}>Rendez-vous</Text>

              <TextInput 
                label="Lieu" 
                mode="outlined"
                value={form.location} 
                onChangeText={t => setForm({...form, location: t})} 
                style={[styles.input, { backgroundColor: colors.inputBg }]}
                outlineColor={colors.border}
                left={<TextInput.Icon icon="map-marker" />}
              />

              <TouchableOpacity 
                 activeOpacity={0.7} 
                 onPress={() => {
                   Keyboard.dismiss();
                   setShowDatePicker(true);
                 }}
                 style={[styles.datePickerBtn, { borderColor: colors.border }]}
              >
                <View style={[styles.dateIcon, { backgroundColor: primaryColor + '15' }]}>
                  <Ionicons name="calendar" size={20} color={primaryColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dateLabel}>Date et Heure</Text>
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
                label="Motif de convocation" 
                mode="outlined"
                multiline 
                numberOfLines={3} 
                value={form.reason} 
                onChangeText={t => setForm({...form, reason: t})} 
                style={[styles.textArea, { backgroundColor: colors.inputBg }]} 
                outlineColor={colors.border}
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
              VALIDER LA CONVOCATION
            </Button>
            
            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16 },
  infoBox: { flexDirection: 'row', padding: 16, borderRadius: 12, marginBottom: 20, alignItems: 'center', gap: 12 },
  infoText: { flex: 1, fontSize: 12, fontWeight: '600' },
  formCard: { padding: 20, borderRadius: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "800", marginBottom: 16, textTransform: 'uppercase', opacity: 0.7 },
  input: { marginBottom: 12 },
  textArea: { marginBottom: 4, minHeight: 80 },
  divider: { height: 1, marginVertical: 20, opacity: 0.1 },
  datePickerBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16, gap: 12 },
  dateIcon: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  dateLabel: { fontSize: 10, fontWeight: "700", color: '#94A3B8' },
  dateValue: { fontSize: 13, fontWeight: "600" },
  btn: { borderRadius: 12, marginTop: 10 },
  btnContent: { height: 54 },
  btnLabel: { fontWeight: 'bold' }
});