import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Dimensions, TextInput, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

// ✅ Architecture
import { useAppTheme } from "../../theme/AppThemeProvider"; 
import { useAuthStore } from "../../stores/useAuthStore";
import { ProsecutorScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import SmartFooter from "../../components/layout/SmartFooter";

export default function ProsecutorHomeScreen({ navigation }: ProsecutorScreenProps<'ProsecutorDashboard'>) {
  const { theme, isDark } = useAppTheme();
  const { user } = useAuthStore();
  
  // 🕒 HORLOGE TEMPS RÉEL (Crucial pour les délais de G.A.V)
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateFull = currentTime.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#F1F5F9",
    justicePrimary: "#7C2D12", // Bordeaux Justice
  };

  const stats = [
    { id: '1', label: 'Nouveaux PV', value: '14', color: '#EF4444', icon: 'document-text' },
    { id: '2', label: 'Instructions', value: '45', color: colors.justicePrimary, icon: 'hammer' },
    { id: '3', label: 'G.A.V actives', value: '08', color: '#F59E0B', icon: 'timer' }, 
  ];

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      
      {/* 🏛️ HEADER AVEC GRADIENT INSTITUTIONNEL */}
      <LinearGradient 
        colors={[colors.justicePrimary, isDark ? "#450A0A" : "#991B1B"]} 
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Ministère Public</Text>
            <Text style={styles.subGreeting}>
              République du Niger • {(user as any)?.district || 'Niamey'}
            </Text>
          </View>
          <View style={[styles.clockContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={styles.clockTime}>{timeString}</Text>
            <Text style={styles.clockDate}>{dateFull.split(' ').slice(0, 2).join(' ')}</Text>
          </View>
        </View>
        
        {/* 🔍 BARRE DE RECHERCHE RAPIDE */}
        <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput 
            placeholder="Rechercher un dossier ou un suspect..." 
            placeholderTextColor="rgba(255,255,255,0.6)"
            style={styles.searchInput}
          />
        </View>
      </LinearGradient>

      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        
        {/* 📊 INDICATEURS STATISTIQUES */}
        <View style={styles.statsRow}>
          {stats.map(s => (
            <TouchableOpacity 
              key={s.id} 
              style={[styles.statCard, { backgroundColor: colors.bgCard }]} 
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: s.color + '15' }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSub }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ⚖️ ACTIONS DE DIRECTION D'ENQUÊTE */}
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>DIRECTION DE L'ACTION PUBLIQUE</Text>
          
          <TouchableOpacity 
            style={[styles.mainActionCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ProsecutorCaseList')}
          >
            <View style={styles.actionContent}>
              <View style={[styles.actionIcon, { backgroundColor: colors.justicePrimary }]}>
                <Ionicons name="list" size={24} color="#FFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.actionTitle, { color: colors.textMain }]}>Registre des Transmissions</Text>
                <Text style={[styles.actionSub, { color: colors.textSub }]}>Traiter les rapports des OPJ du district</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSub} />
            </View>
          </TouchableOpacity>

          {/* 🚨 ALERTES MANDATS & DÉLAIS */}
          <View style={[styles.alertBox, { backgroundColor: isDark ? "#450A0A" : "#FEF2F2", borderColor: "#EF4444" }]}>
            <View style={styles.alertHeader}>
                <Ionicons name="alert-circle" size={22} color="#EF4444" />
                <Text style={styles.alertTitleBadge}>URGENCE</Text>
            </View>
            <Text style={[styles.alertText, { color: isDark ? "#FCA5A5" : "#991B1B" }]}>
              <Text style={{ fontWeight: '900' }}>Échéance :</Text> 3 mandats de dépôt arrivent à expiration. Veuillez réviser les dossiers de détention préventive.
            </Text>
          </View>
        </View>

        {/* 📅 SERVICES SUPPLÉMENTAIRES */}
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>SERVICES DU PARQUET</Text>
          <View style={styles.toolsGrid}>
            <ToolItem icon="calendar" label="Audiences" color="#6366F1" colors={colors} />
            <ToolItem icon="people" label="Défèrements" color="#10B981" colors={colors} />
            <ToolItem icon="shield-checkmark" label="Mandats" color="#F59E0B" colors={colors} />
          </View>
        </View>

      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const ToolItem = ({ icon, label, color, colors }: any) => (
  <TouchableOpacity style={[styles.toolCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
    <View style={[styles.toolIcon, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={[styles.toolLabel, { color: colors.textMain }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: { padding: 25, paddingTop: 50, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, height: 230 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  subGreeting: { color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 12, marginTop: 4 },
  
  clockContainer: { alignItems: 'flex-end', padding: 10, borderRadius: 15 },
  clockTime: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  clockDate: { color: '#FFF', fontSize: 9, fontWeight: '700', marginTop: 2 },

  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 15, height: 48 },
  searchInput: { flex: 1, marginLeft: 10, color: '#FFF', fontSize: 14, fontWeight: '600' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: -35 },
  statCard: { 
    padding: 18, 
    borderRadius: 24, 
    width: '31%', 
    elevation: 8, 
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
      web: { boxShadow: '0px 8px 20px rgba(0,0,0,0.1)' }
    })
  },
  iconCircle: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', marginTop: 2 },
  
  content: { padding: 20, marginTop: 10 },
  sectionTitle: { fontSize: 10, fontWeight: '900', marginBottom: 15, letterSpacing: 1.5, textTransform: 'uppercase' },
  
  mainActionCard: { borderRadius: 28, overflow: 'hidden', borderWidth: 1 },
  actionContent: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  actionIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontWeight: '900', fontSize: 15 },
  actionSub: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  
  alertBox: { padding: 18, borderRadius: 24, marginTop: 20, borderLeftWidth: 6 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  alertTitleBadge: { backgroundColor: '#EF4444', color: '#FFF', fontSize: 9, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 10 },
  alertText: { fontSize: 12, lineHeight: 18, fontWeight: '500' },

  toolsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  toolCard: { width: '31%', padding: 18, borderRadius: 22, alignItems: 'center', borderWidth: 1 },
  toolIcon: { width: 46, height: 46, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  toolLabel: { fontSize: 11, fontWeight: '800' }
});