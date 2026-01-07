import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'; // Ajout de FontAwesome5 pour la balance
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Stores & Thème
import { useAuthStore } from '../../stores/useAuthStore';
import { getAppTheme } from '../../theme';
import { useAppTheme } from '../../theme/AppThemeProvider';

export default function SmartFooter() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { isDark } = useAppTheme();
  const theme = getAppTheme();

  const userRole = (user?.role || "citizen").toLowerCase();

  // Définition exhaustive des menus par rôle
  const menuItems = useMemo(() => {
    switch (userRole) {
      case 'admin':
        return [
          { icon: 'home', label: 'Accueil', target: 'AdminHome' },
          { icon: 'people', label: 'Agents', target: 'AdminUsers' }, 
          { icon: 'business', label: 'Unités', target: 'ManageStations' }, 
          { icon: 'stats-chart', label: 'Stats', target: 'AdminStats' },
        ];

      case 'officier_police':
      case 'commissaire':
      case 'inspecteur':
      case 'opj_gendarme':
      case 'gendarme':
        return [
          { icon: 'home', label: 'Accueil', target: 'PoliceHome' },
          { icon: 'folder-open', label: 'Dossiers', target: 'PoliceComplaints' },
          { icon: 'add-circle', label: 'Nouveau PV', target: 'PolicePVScreen', highlight: true },
          { icon: 'map', label: 'Carte', target: 'NationalMap' },
        ];

      case 'prosecutor':
        return [
          { icon: 'home', label: 'Accueil', target: 'ProsecutorHome' },
          { icon: 'list', label: 'Parquet', target: 'ProsecutorCaseList' },
          { icon: 'stats-chart', label: 'Analyse', target: 'ProsecutorDashboard' },
        ];

      case 'judge':
        return [
          { icon: 'home', label: 'Accueil', target: 'JudgeHome' },
          { icon: 'calendar', label: 'Audiences', target: 'JudgeHearing' },
          { icon: 'document-text', label: 'Décisions', target: 'JudgeDecisions' },
          { icon: 'search', label: 'Recherche', target: 'WarrantSearch' },
        ];

      case 'greffier':
        return [
          { icon: 'home', label: 'Accueil', target: 'ClerkHome' },
          { icon: 'calendar', label: 'Calendrier', target: 'ClerkCalendar' },
          { icon: 'layers', label: 'Rôles', target: 'ClerkComplaints' },
          { icon: 'add-circle', label: 'Enrôler', target: 'ClerkRegisterCase', highlight: true },
        ];

      case 'lawyer':
        return [
          { icon: 'home', label: 'Accueil', target: 'LawyerTracking' },
          { icon: 'briefcase', label: 'Dossiers', target: 'LawyerCaseList' },
          { icon: 'calendar', label: 'Audiences', target: 'LawyerCalendar' },
        ];

      case 'bailiff':
        return [
          { icon: 'home', label: 'Accueil', target: 'BailiffHome' },
          { icon: 'send', label: 'Missions', target: 'BailiffMissions' },
          { icon: 'calendar', label: 'Agenda', target: 'BailiffCalendar' },
        ];

      default: // Citoyen
        return [
          { icon: 'home', label: 'Accueil', target: 'CitizenHome' },
          { icon: 'add-circle', label: 'Plainte', target: 'CitizenCreateComplaint', highlight: true },
          { icon: 'list', label: 'Suivis', target: 'CitizenMyComplaints' },
          { icon: 'book', label: 'Annuaire', target: 'CitizenDirectory' },
        ];
    }
  }, [userRole]);

  // Détermination de la couleur d'accentuation selon le rôle
  const getActiveColor = () => {
    if (userRole === 'admin') return '#1E293B';
    if (['officier_police', 'commissaire', 'inspecteur'].includes(userRole)) return '#1E3A8A';
    if (userRole.includes('gendarme')) return '#065F46';
    if (['judge', 'prosecutor', 'greffier'].includes(userRole)) return '#7C2D12';
    if (['lawyer', 'bailiff'].includes(userRole)) return '#4338CA';
    return theme.color;
  };

  const activeColor = getActiveColor();
  const inactiveColor = isDark ? "#64748B" : "#94A3B8";

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
        borderTopColor: isDark ? "#333" : "#E2E8F0",
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
        height: Platform.OS === 'ios' ? 70 + insets.bottom : 70
      }
    ]}>
      {menuItems.map((item, index) => {
        const isActive = route.name === item.target;
        
        return (
          <TouchableOpacity 
            key={index} 
            activeOpacity={0.7}
            style={styles.tab} 
            onPress={() => navigation.navigate(item.target)}
          >
            <View style={item.highlight ? [styles.highlightCircle, { backgroundColor: activeColor }] : null}>
              <Ionicons 
                name={isActive ? (item.icon as any) : `${item.icon}-outline` as any} 
                size={item.highlight ? 28 : 24} 
                color={item.highlight ? "#FFFFFF" : (isActive ? activeColor : inactiveColor)} 
              />
            </View>
            {!item.highlight && (
              <Text style={[styles.label, { color: isActive ? activeColor : inactiveColor }]}>
                {item.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    zIndex: 1000,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  highlightCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25, 
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '700',
  }
});