import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Architecture
import { useAuthStore } from '../../stores/useAuthStore';
import { useAppTheme } from '../../theme/AppThemeProvider'; // ✅ Hook dynamique
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';

export default function CommissaireDashboard() {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();

  // 🕒 ÉTAT POUR L'HORLOGE TEMPS RÉEL
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#F1F5F9",
    alertBorder: isDark ? "#7F1D1D" : "#FEE2E2",
    alertBg: isDark ? "#450A0A" : "#FFF5F5",
  };

  // Formattage Date & Heure
  const timeString = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const unitTitle = user?.lastname 
    ? `Commissariat de ${(user as any)?.district || 'Niamey'}`
    : 'Unité de Commandement';

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Tableau de Bord" showMenu />

      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* 🏛️ HEADER AVEC HORLOGE DYNAMIQUE */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.unitLabel, { color: colors.textSub }]}>SITUATION AU RÉGIMENT</Text>
              <Text style={[styles.unitName, { color: primaryColor }]}>{unitTitle}</Text>
            </View>
            <View style={[styles.rankBadge, { backgroundColor: primaryColor + '15' }]}>
               <Ionicons name="ribbon-outline" size={24} color={primaryColor} />
            </View>
          </View>

          {/* 🕒 WIDGET HORLOGE */}
          <LinearGradient 
            colors={[primaryColor, isDark ? "#1E3A8A" : primaryColor + 'DD']} 
            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
            style={styles.clockCard}
          >
            <View>
              <Text style={styles.clockTime}>{timeString}</Text>
              <Text style={styles.clockDate}>{dateString.toUpperCase()}</Text>
            </View>
            <Ionicons name="time-outline" size={44} color="rgba(255,255,255,0.3)" />
          </LinearGradient>
        </View>

        {/* 🚨 ALERTES CRITIQUES (DÉLAIS LÉGAUX) */}
        <TouchableOpacity 
          style={[styles.alertCard, { backgroundColor: colors.alertBg, borderColor: colors.alertBorder }]} 
          activeOpacity={0.9}
        >
          <View style={styles.alertContent}>
            <View style={[styles.alertIconBox, { backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" }]}>
              <Ionicons name="warning-outline" size={22} color="#EF4444" />
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.alertTitle, { color: isDark ? "#FECACA" : "#1E293B" }]}>Surveillance des Délais GAV</Text>
              <Text style={[styles.alertSub, { color: "#EF4444" }]}>4 dossiers expirent dans moins de 6 heures.</Text>
            </View>
            <View style={styles.badgeCritical}>
              <Text style={styles.badgeText}>CRITIQUE</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 📊 KPI PERFORMANCE */}
        <View style={styles.statsGrid}>
          <StatCard 
            label="VISAS REQUIS" 
            value="12" 
            icon="shield-checkmark-outline" 
            color="#8B5CF6" 
            onPress={() => navigation.navigate('CommissaireVisaList')}
            colors={colors}
          />
          <StatCard 
            label="ENQUÊTES" 
            value="45" 
            icon="search-outline" 
            color={primaryColor} 
            onPress={() => navigation.navigate('CommissaireRegistry')}
            colors={colors}
          />
        </View>

        {/* 🚀 ACTIONS RAPIDES */}
        <Text style={[styles.sectionTitle, { color: colors.textSub }]}>COMMANDEMENT OPÉRATIONNEL</Text>
        <View style={styles.actionGrid}>
          <QuickAction title="Assigner" icon="person-add-outline" color="#0EA5E9" onPress={() => {}} colors={colors} />
          <QuickAction title="Visas" icon="document-text-outline" color="#8B5CF6" onPress={() => navigation.navigate('CommissaireVisaList')} colors={colors} />
          <QuickAction title="Registre" icon="archive-outline" color="#64748B" onPress={() => navigation.navigate('CommissaireRegistry')} colors={colors} />
          <QuickAction title="Alertes" icon="notifications-outline" color="#F59E0B" onPress={() => {}} colors={colors} />
        </View>

        {/* 📈 ANALYSE DE LA CÉLÉRITÉ */}
        <View style={[styles.performanceCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.perfTitle, { color: colors.textMain }]}>Taux de Transmission Parquet</Text>
          <View style={styles.perfRow}>
            <View style={[styles.progressBarBg, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}>
              <View style={[styles.progressBarFill, { width: '84%', backgroundColor: primaryColor }]} />
            </View>
            <Text style={[styles.perfValue, { color: primaryColor }]}>84%</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      <SmartFooter />
    </ScreenContainer>
  );
}

// 🧩 COMPOSANTS INTERNES
const StatCard = ({ label, value, icon, color, onPress, colors }: any) => (
  <TouchableOpacity 
    style={[styles.statCard, { backgroundColor: colors.bgCard, borderLeftColor: color }]} 
    onPress={onPress}
  >
    <Ionicons name={icon} size={22} color={color} />
    <Text style={[styles.statValue, { color: colors.textMain }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSub }]}>{label}</Text>
  </TouchableOpacity>
);

const QuickAction = ({ title, icon, color, onPress, colors }: any) => (
  <TouchableOpacity style={styles.qAction} onPress={onPress}>
    <View style={[styles.qIconBox, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <Ionicons name={icon} size={26} color={color} />
    </View>
    <Text style={[styles.qText, { color: colors.textMain }]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 140 },
  headerSection: { marginBottom: 25 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  unitLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  unitName: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  rankBadge: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  
  clockCard: { borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 }, android: { elevation: 8 } }) },
  clockTime: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  clockDate: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '700', marginTop: 4 },

  alertCard: { marginBottom: 25, borderRadius: 20, borderWidth: 1.5, ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 }, android: { elevation: 3 } }) },
  alertContent: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  alertIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  alertTitle: { fontSize: 13, fontWeight: '800' },
  alertSub: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  badgeCritical: { backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#FFF', fontSize: 8, fontWeight: '900' },

  statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  statCard: { flex: 1, padding: 18, borderRadius: 24, borderLeftWidth: 6, ...Platform.select({ android: { elevation: 2 } }) },
  statValue: { fontSize: 24, fontWeight: '900', marginVertical: 4 },
  statLabel: { fontSize: 9, fontWeight: '800' },

  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 15, textTransform: 'uppercase' },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  qAction: { alignItems: 'center', width: (Dimensions.get('window').width - 40) / 4.5 },
  qIconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1 },
  qText: { fontSize: 11, fontWeight: '700' },

  performanceCard: { padding: 20, borderRadius: 24, borderWidth: 1 },
  perfTitle: { fontSize: 13, fontWeight: '800', marginBottom: 12 },
  perfRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  progressBarBg: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  perfValue: { fontSize: 16, fontWeight: '900' }
});