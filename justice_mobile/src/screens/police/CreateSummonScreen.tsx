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
import { getAppTheme } from "../../theme"; // Alignement sur getAppTheme()
import { PoliceScreenProps } from "../../types/navigation";

export default function CreateSummonScreen({ route, navigation }: PoliceScreenProps<'CreateSummon'>) {
  // ✅ Thème aligné sur l'architecture Police (Bleu Roi)
  const theme = getAppTheme();
  const primaryColor = theme.color;
  const isDark = false; // Par défaut pour la police en mode jour
  
  // Récupération sécurisée du paramètre complaintId (lié au PV initial)
  const params = route.params as any;
  const complaintId = params?.complaintId || 'NC';
  
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [form, setForm] = useState({
    targetName: '',
    targetPhone: '',
    location: '',
    scheduledAt: new Date(),
    reason: ''
  });

  const isFormValid = form.targetName.trim().length > 2 && form.location.trim().length > 2;

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setForm({ ...form, scheduledAt: selectedDate });
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      return Alert.alert("Champs obligatoires", "Le nom de la personne et le lieu de l'audition sont requis.");
    }

    Alert.alert(
      "Validation de l'acte",
      `Souhaitez-vous générer et enregistrer cette convocation pour ${form.targetName} ?`,
      [
        { text: "Réviser", style: "cancel" },
        { 
          text: "Confirmer & Générer", 
          onPress: async () => {
            setLoading(true);
            try {
              await createSummon({ 
                ...form, 
                complaintId,
                scheduledAt: form.scheduledAt.toISOString() 
              });
              Alert.alert("Succès ⚖️", "L'acte a été versé au dossier numérique.");
              navigation.goBack();
            } catch (error) {
              Alert.alert("Erreur", "Le serveur de la justice est momentanément indisponible.");
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
      <StatusBar barStyle="light-content" />
      <AppHeader title="Émettre une Convocation" showBack />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          
          {/* 🛡️ Bandeau de responsabilité juridique */}
          <View style={[styles.infoBox, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="shield-checkmark" size={24} color={primaryColor} />
            <Text style={[styles.infoText, { color: "#1E3A8A" }]}>
              Cet acte d'instruction engage la responsabilité de l'Officier de Police Judiciaire (OPJ) signataire.
            </Text>
          </View>

          <Surface style={styles.formCard} elevation={2}>
            <Text style={[styles.sectionTitle, { color: primaryColor }]}>Identité du Convoqué</Text>
            
            <TextInput 
              label="Nom Complet" 
              mode="outlined"
              value={form.targetName} 
              onChangeText={t => setForm({...form, targetName: t})} 
              style={styles.input}
              outlineColor="#E2E8F0"
              activeOutlineColor={primaryColor}
              left={<TextInput.Icon icon="account-tie" />}
            />

            <TextInput 
              label="Numéro de Téléphone" 
              mode="outlined"
              keyboardType="phone-pad" 
              value={form.targetPhone} 
              onChangeText={t => setForm({...form, targetPhone: t})} 
              style={styles.input}
              outlineColor="#E2E8F0"
              activeOutlineColor={primaryColor}
              left={<TextInput.Icon icon="phone" />}
            />

            <View style={styles.divider} />

            <Text style={[styles.sectionTitle, { color: primaryColor }]}>Détails de l'Audition</Text>

            <TextInput 
              label="Lieu (Commissariat / Bureau)" 
              mode="outlined"
              placeholder="Ex: Bureau 4, Commissariat Central de Niamey"
              value={form.location} 
              onChangeText={t => setForm({...form, location: t})} 
              style={styles.input}
              outlineColor="#E2E8F0"
              activeOutlineColor={primaryColor}
              left={<TextInput.Icon icon="map-marker" />}
            />

            <TouchableOpacity 
               activeOpacity={0.7} 
               onPress={() => setShowDatePicker(true)}
               style={styles.datePickerBtn}
            >
              <View style={[styles.dateIcon, { backgroundColor: primaryColor + '15' }]}>
                <Ionicons name="calendar" size={20} color={primaryColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dateLabel}>Date et Heure fixées</Text>
                <Text style={styles.dateValue}>
                  {format(form.scheduledAt, "eeee dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
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
              label="Objet de la convocation" 
              mode="outlined"
              multiline 
              numberOfLines={4} 
              placeholder="Précisez le motif légal de l'acte..."
              value={form.reason} 
              onChangeText={t => setForm({...form, reason: t})} 
              style={styles.textArea} 
              outlineColor="#E2E8F0"
              activeOutlineColor={primaryColor}
            />
          </Surface>

          <Button 
            mode="contained" 
            onPress={handleSubmit} 
            loading={loading} 
            disabled={loading || !isFormValid}
            style={[styles.btn, { backgroundColor: primaryColor }]}
            contentStyle={styles.btnContent}
            icon="file-document-edit"
          >
            SIGNER ET GÉNÉRER L'ACTE
          </Button>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 120 },
  infoBox: { 
    flexDirection: 'row', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 20,
    alignItems: 'center',
    gap: 12
  },
  infoText: { flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 18 },
  formCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 25,
    backgroundColor: '#FFF'
  },
  sectionTitle: { fontSize: 13, fontWeight: "900", marginBottom: 18, textTransform: 'uppercase', letterSpacing: 1 },
  input: { marginBottom: 16, backgroundColor: '#FFF' },
  textArea: { marginBottom: 4, backgroundColor: '#FFF', minHeight: 100 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },

  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    gap: 12
  },
  dateIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  dateLabel: { fontSize: 10, fontWeight: "800", color: '#94A3B8', textTransform: 'uppercase' },
  dateValue: { fontSize: 14, fontWeight: "700", marginTop: 2, color: "#1E293B" },

  btn: { borderRadius: 16, elevation: 4, marginTop: 10 },
  btnContent: { height: 56 }
});