// PATH: src/components/layout/SmartFooter.tsx
import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '../../stores/useAuthStore';
import { useAppTheme } from '../../theme/AppThemeProvider';

interface MenuItem {
  icon: string;
  label: string;
  target: string;
  highlight?: boolean;
}

export default function SmartFooter() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { theme, isDark } = useAppTheme();

  const userRole = (user?.role || "citizen").toLowerCase();

  const menuItems = useMemo((): MenuItem[] => {
    switch (userRole) {
      case 'admin':
        return [
          { icon: 'grid', label: 'Dashboard', target: 'AdminHome' },
          { icon: 'people', label: 'Agents', target: 'AdminUsers' },
          { icon: 'stats-chart', label: 'Stats', target: 'AdminStats', highlight: true },
          { icon: 'pulse', label: 'Audit', target: 'AdminAuditTrail' },
          { icon: 'person', label: 'Profil', target: 'Profile' },
        ];

      case 'officier_police':
      case 'inspecteur':
      case 'opj_gendarme':
      case 'gendarme':
        return [
          { icon: 'home', label: 'Accueil', target: 'PoliceHome' },
          { icon: 'folder-open', label: 'Dossiers', target: 'PoliceComplaints' },
          { icon: 'add', label: 'Nouveau PV', target: 'PolicePVScreen', highlight: true },
          { icon: 'map', label: 'Carte', target: 'NationalMap' },
          { icon: 'person', label: 'Profil', target: 'Profile' },
        ];

      case 'commissaire':
        return [
          { icon: 'home', label: 'Accueil', target: 'CommissaireDashboard' },
          { icon: 'checkmark-done', label: 'Visas', target: 'CommissaireVisaList' },
          { icon: 'lock-closed', label: 'GAV', target: 'CommissaireGAVSupervision', highlight: true },
          { icon: 'book', label: 'Registre', target: 'CommissaireRegistry' },
          { icon: 'person', label: 'Profil', target: 'Profile' },
        ];

      case 'prosecutor':
      case 'judge':
        return [
          { icon: 'home', label: 'Accueil', target: userRole === 'prosecutor' ? 'ProsecutorDashboard' : 'JudgeHome' },
          { icon: 'file-tray-full', label: 'Dossiers', target: userRole === 'prosecutor' ? 'ProsecutorCaseList' : 'JudgeCaseList' },
          { icon: 'search', label: 'Mandats', target: 'WarrantSearch', highlight: true },
          { icon: 'calendar', label: 'Audiences', target: userRole === 'prosecutor' ? 'ProsecutorCalendar' : 'JudgeCalendar' },
          { icon: 'person', label: 'Profil', target: 'Profile' },
        ];

      case 'greffier':
        return [
          { icon: 'home', label: 'Accueil', target: 'ClerkHome' },
          { icon: 'calendar', label: 'Rôles', target: 'ClerkCalendar' },
          { icon: 'add', label: 'Enrôler', target: 'ClerkRegisterCase', highlight: true },
          { icon: 'layers', label: 'Registres', target: 'ClerkComplaints' },
          { icon: 'person', label: 'Profil', target: 'Profile' },
        ];

      default:
        return [
          { icon: 'home', label: 'Accueil', target: 'CitizenHome' },
          { icon: 'folder-open', label: 'Suivis', target: 'CitizenMyComplaints' },
          { icon: 'add', label: 'Plainte', target: 'CitizenCreateComplaint', highlight: true },
          { icon: 'library', label: 'Droits', target: 'CitizenLegalGuide' },
          { icon: 'person', label: 'Profil', target: 'Profile' },
        ];
    }
  }, [userRole]);

  const getActiveColor = () => {
    if (userRole === 'admin') return '#1E293B';
    if (['officier_police', 'commissaire', 'inspecteur'].includes(userRole)) return '#2563EB';
    if (userRole.includes('gendarme')) return '#059669';
    if (['judge', 'prosecutor', 'greffier'].includes(userRole)) return '#7C3AED';
    return '#0891B2';
  };

  const activeColor = getActiveColor();
  const inactiveColor = isDark ? "#64748B" : "#94A3B8";
  const bgColor = isDark ? "#1E293B" : "#FFFFFF";

  const handleNavigation = (target: string) => {
    try {
      navigation.navigate(target);
    } catch (error) {
      console.warn(`Route introuvable : ${target}`);
    }
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: bgColor,
        borderTopColor: isDark ? "#334155" : "#F1F5F9",
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
        height: Platform.OS === 'ios' ? 65 + insets.bottom : 70
      }
    ]}>
      {menuItems.map((item, index) => {
        const isActive = route.name === item.target;

        if (item.highlight) {
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              style={styles.highlightContainer}
              onPress={() => handleNavigation(item.target)}
            >
              <View style={[
                styles.highlightCircle,
                { backgroundColor: activeColor, borderColor: bgColor }
              ]}>
                <Ionicons name={item.icon as any} size={30} color="#FFFFFF" />
              </View>
              <Text style={[styles.label, { color: activeColor, fontWeight: '800', marginTop: 35 }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            style={styles.tab}
            onPress={() => handleNavigation(item.target)}
          >
            <Ionicons
              name={isActive ? (item.icon as any) : `${item.icon}-outline` as any}
              size={24}
              color={isActive ? activeColor : inactiveColor}
            />
            <Text style={[
              styles.label,
              { color: isActive ? activeColor : inactiveColor, fontWeight: isActive ? '700' : '500' }
            ]}>
              {item.label}
            </Text>
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
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
    zIndex: 1000,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  highlightContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    marginBottom: 20
  },
  highlightCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 4,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
  }
});