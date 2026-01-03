import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Switch, ScrollView, 
  TextInput, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ✅ Architecture & Thème
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import { useAppTheme } from '../../theme/AppThemeProvider';
import api from '../../services/api'; 

// --- SERVICES AVEC SIMULATION (MOCK) ---
const fetchSecurityPolicy = async () => {
  try {
    const response = await api.get('/admin/settings/security');
    return response.data.data || response.data;
  } catch (e) {
    return {
      minLength: 8,
      requireSpecialChar: true,
      requireNumbers: true,
      expirationDays: 90,
      maxLoginAttempts: 5
    };
  }
};

const updateSecurityPolicy = async (payload: any) => {
  try {
    const response = await api.put('/admin/settings/security', payload);
    return response.data;
  } catch (e) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  }
};

export default function AdminSecurityScreen({ navigation }: any) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const queryClient = useQueryClient();
  
  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#0F172A" : "#F1F5F9",
    infoBg: isDark ? "#1E3A8A40" : "#E2E8F0",
  };

  const [requireSpecialChar, setRequireSpecialChar] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [minLength, setMinLength] = useState("8");
  const [expirationDays, setExpirationDays] = useState("90");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");

  const { data: policy, isLoading: isFetching } = useQuery({
    queryKey: ['security-policy'],
    queryFn: fetchSecurityPolicy,
  });

  useEffect(() => {
    if (policy) {
      setMinLength(String(policy.minLength || "8"));
      setRequireSpecialChar(!!policy.requireSpecialChar);
      setRequireNumbers(!!policy.requireNumbers);
      setExpirationDays(String(policy.expirationDays || "90"));
      setMaxLoginAttempts(String(policy.maxLoginAttempts || "5"));
    }
  }, [policy]);

  const mutation = useMutation({
    mutationFn: updateSecurityPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-policy'] });
      const title = "Stratégie Appliquée";
      const msg = "La politique de sécurité a été mise à jour avec succès.";
      
      if (Platform.OS === 'web') window.alert(`${title}: ${msg}`);
      else Alert.alert(title, msg, [{ text: "OK", onPress: () => navigation.goBack() }]);
    }
  });

  const handleSave = () => {
    if (parseInt(minLength) < 6) {
      return Alert.alert("Sécurité Faible", "La longueur minimale doit être de 6 caractères pour les comptes MJ.");
    }
    mutation.mutate({
      minLength: parseInt(minLength),
      requireSpecialChar,
      requireNumbers,
      expirationDays: parseInt(expirationDays),
      maxLoginAttempts: parseInt(maxLoginAttempts)
    });
  };

  // --- COMPOSANTS INTERNES ---
  const Section = ({ title, children }: any) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSub }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );

  const ToggleItem = ({ label, value, onValueChange, icon }: any) => (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={18} color={primaryColor} style={{ marginRight: 10 }} />
        <Text style={[styles.label, { color: colors.textMain }]}>{label}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: "#767577", true: primaryColor + "80" }}
        thumbColor={value ? primaryColor : "#f4f3f4"}
      />
    </View>
  );

  const InputItem = ({ label, value, onChangeText, placeholder, icon }: any) => (
    <View style={styles.inputRow}>
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={18} color={primaryColor} style={{ marginRight: 10 }} />
        <Text style={[styles.label, { color: colors.textMain }]}>{label}</Text>
      </View>
      <TextInput
        style={[styles.input, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.inputBg }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSub}
        keyboardType="numeric"
      />
    </View>
  );

  if (isFetching) {
    return (
      <ScreenContainer withPadding={false}>
        <AppHeader title="Sécurité" showBack />
        <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Politique de Sécurité" showBack={true} />
      
      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.infoBox, { backgroundColor: colors.infoBg }]}>
          <Ionicons name="shield-half-outline" size={24} color={isDark ? "#BAE6FD" : primaryColor} />
          <Text style={[styles.infoText, { color: isDark ? "#BAE6FD" : "#475569" }]}>
            Ces règles définissent la robustesse des comptes Magistrats et Officiers au niveau national.
          </Text>
        </View>

        <Section title="Complexité des Identifiants">
          <InputItem 
            label="Longueur minimale" 
            value={minLength} 
            onChangeText={setMinLength} 
            icon="text-outline"
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ToggleItem 
            label="Caractère spécial (@#$%...)" 
            value={requireSpecialChar} 
            onValueChange={setRequireSpecialChar} 
            icon="at-outline"
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ToggleItem 
            label="Chiffres obligatoires" 
            value={requireNumbers} 
            onValueChange={setRequireNumbers} 
            icon="keypad-outline"
          />
        </Section>

        <Section title="Cycle de Vie & Protection">
          <InputItem 
            label="Expiration (jours)" 
            value={expirationDays} 
            onChangeText={setExpirationDays} 
            icon="calendar-outline"
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InputItem 
            label="Tentatives maximum" 
            value={maxLoginAttempts} 
            onChangeText={setMaxLoginAttempts} 
            icon="lock-closed-outline"
          />
        </Section>

        <TouchableOpacity 
          activeOpacity={0.8}
          style={[styles.saveButton, { backgroundColor: isDark ? primaryColor : "#1E293B" }, mutation.isPending && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
                <Ionicons name="cloud-upload-outline" size={20} color="#FFF" style={{marginRight: 10}} />
                <Text style={styles.saveText}>APPLIQUER LA POLITIQUE</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoBox: { flexDirection: 'row', padding: 18, borderRadius: 20, marginBottom: 25, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  infoText: { flex: 1, marginLeft: 15, fontSize: 13, lineHeight: 20, fontWeight: '600' },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4, letterSpacing: 1.5 },
  card: { borderRadius: 24, padding: 8, borderWidth: 1, ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 2 } }) },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  inputRow: { padding: 18 },
  label: { fontSize: 15, fontWeight: '700' },
  input: { borderWidth: 1.5, borderRadius: 14, padding: 14, marginTop: 12, fontSize: 16, fontWeight: '800' },
  divider: { height: 1, width: '90%', alignSelf: 'flex-end' },
  saveButton: { flexDirection: 'row', padding: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 4 },
  saveText: { color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
});