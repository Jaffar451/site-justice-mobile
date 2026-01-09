// PATH: src/screens/bailiff/BailiffCalendarScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ Architecture & Thème
import { useAppTheme } from '../../theme/AppThemeProvider';
import { BailiffScreenProps } from '../../types/navigation';
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';
import api from '../../services/api';

export default function BailiffCalendarScreen({ navigation }: BailiffScreenProps<'BailiffCalendar'>) {
  const { theme, isDark } = useAppTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🟣 Palette Huissier (Indigo / Royal)
  const primaryColor = "#4F46E5"; 
  const colors = {
    bg: isDark ? "#0F172A" : "#F8FAFC",
    card: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#1E293B",
    subText: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0"
  };

  // 📡 RÉCUPÉRATION DES MISSIONS DU JOUR
  useEffect(() => {
    let isMounted = true;
    const fetchMissions = async () => {
      setLoading(true);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        // Appel API simulé ou réel vers les missions assignées
        const response = await api.get(`/bailiff/missions`, { params: { date: dateStr } });
        
        if (isMounted) {
          const data = response.data?.data || response.data || [];
          setMissions(data);
        }
      } catch (error) {
        console.error("[BailiffCalendar] Erreur:", error);
        if (isMounted) setMissions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMissions();
    return () => { isMounted = false; };
  }, [selectedDate]);

  const renderMissionItem = ({ item, index }: any) => {
    const isUrgent = item.priority === 'high' || item.isUrgent;
    
    return (
      <View style={styles.timelineItem}>
        {/* Colonne Heure/Point */}
        <View style={styles.timeColumn}>
          <Text style={[styles.timeText, { color: colors.text }]}>{item.scheduledTime || "08:00"}</Text>
          <View style={[styles.dot, { backgroundColor: isUrgent ? "#EF4444" : primaryColor }]} />
          {index !== missions.length - 1 && <View style={[styles.verticalLine, { backgroundColor: colors.border }]} />}
        </View>

        {/* Carte de Mission */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('BailiffMissions')}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.tag, { backgroundColor: primaryColor + '15' }]}>
              <Text style={[styles.tagText, { color: primaryColor }]}>{item.type || "SIGNIFICATION"}</Text>
            </View>
            {isUrgent && (
              <View style={styles.urgentBadge}>
                <Ionicons name="flash" size={10} color="#FFF" />
                <Text style={styles.urgentText}>PRIORITAIRE</Text>
              </View>
            )}
          </View>

          <Text style={[styles.destinataire, { color: colors.text }]}>{item.targetName || "Destinataire Inconnu"}</Text>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.subText} />
            <Text style={[styles.locationText, { color: colors.subText }]} numberOfLines={1}>
              {item.address || "Adresse non spécifiée"}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.cardFooter}>
            <Text style={[styles.caseRef, { color: colors.subText }]}>Dossier : {item.caseRef || "N/A"}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.border} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Agenda des Tournées" showBack />

      {/* 📅 SÉLECTEUR DE DATE HORIZONTAL */}
      <View style={[styles.dateStrip, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
          {[-2, -1, 0, 1, 2, 3, 4, 5, 6].map((offset) => {
            const date = new Date();
            date.setDate(date.getDate() + offset);
            const isSelected = date.toDateString() === selectedDate.toDateString();

            return (
              <TouchableOpacity 
                key={offset} 
                style={[styles.dateItem, isSelected && { backgroundColor: primaryColor }]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dayName, { color: isSelected ? '#FFF' : colors.subText }]}>
                    {date.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase()}
                </Text>
                <Text style={[styles.dayNum, { color: isSelected ? '#FFF' : colors.text }]}>
                    {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.content, { backgroundColor: colors.bg }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
             {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <View style={[styles.countBadge, { backgroundColor: primaryColor }]}>
            <Text style={styles.countText}>{missions.length}</Text>
          </View>
        </View>

        {loading ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={{ marginTop: 10, color: colors.subText }}>Calcul de l'itinéraire...</Text>
            </View>
        ) : (
            <FlatList
                data={missions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderMissionItem}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={60} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.subText }]}>Aucun acte à signifier pour cette date.</Text>
                    </View>
                }
            />
        )}
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dateStrip: { paddingVertical: 15, borderBottomWidth: 1 },
  dateItem: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 16, marginRight: 10, minWidth: 60 },
  dayName: { fontSize: 10, fontWeight: '800', marginBottom: 4 },
  dayNum: { fontSize: 18, fontWeight: '900' },

  content: { flex: 1, padding: 20 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, gap: 10 },
  summaryTitle: { fontSize: 16, fontWeight: '900', textTransform: 'capitalize' },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { color: '#FFF', fontSize: 12, fontWeight: '900' },

  timelineItem: { flexDirection: 'row', gap: 15, marginBottom: 5 },
  timeColumn: { alignItems: 'center', width: 45 },
  timeText: { fontSize: 12, fontWeight: '800', marginBottom: 5 },
  dot: { width: 12, height: 12, borderRadius: 6, zIndex: 2 },
  verticalLine: { width: 2, flex: 1, marginVertical: 2 },

  card: { flex: 1, borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, elevation: 2, shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: {width:0, height:2} },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  urgentBadge: { backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  urgentText: { color: '#FFF', fontSize: 8, fontWeight: '900' },

  destinataire: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { fontSize: 12, fontWeight: '500' },
  
  divider: { height: 1, marginVertical: 12, opacity: 0.5 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  caseRef: { fontSize: 11, fontWeight: '700', fontStyle: 'italic' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText: { fontSize: 14, fontStyle: 'italic', textAlign: 'center' }
});