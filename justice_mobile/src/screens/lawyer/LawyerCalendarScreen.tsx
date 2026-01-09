import React, { useState, useMemo, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, startOfToday, addDays, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";

// ✅ 1. Imports Architecture
import { useAppTheme } from "../../theme/AppThemeProvider";
import { LawyerScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { getAllHearings, Hearing } from "../../services/hearing.service";

export default function LawyerCalendarScreen({ navigation }: LawyerScreenProps<'LawyerCalendar'>) {
  // ✅ 2. Thème Dynamique (Noir & Or pour Avocats)
  const { theme, isDark } = useAppTheme();
  // On peut forcer une couleur "Or" spécifique pour les avocats ou utiliser le primaire du thème
  const goldColor = "#D4AF37"; 
  const activeColor = isDark ? goldColor : theme.colors.primary;

  const [selectedDate, setSelectedDate] = useState(startOfToday());
  
  // Génération des 14 prochains jours
  const weekDays = useMemo(() => 
    Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i)), 
  []);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    bgStrip: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    gold: goldColor
  };

  // ✅ 3. Récupération des données réelles
  const { data: hearings, isLoading, refetch } = useQuery({
    queryKey: ['lawyer-hearings'],
    queryFn: getAllHearings
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // ✅ 4. Filtrage local par date sélectionnée
  const dailyEvents = useMemo(() => {
    if (!hearings) return [];
    return hearings.filter(h => isSameDay(parseISO(h.date), selectedDate));
  }, [hearings, selectedDate]);

  const renderDateItem = ({ item }: { item: Date }) => {
    const isSelected = isSameDay(item, selectedDate);
    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => setSelectedDate(item)}
        style={[
          styles.dateItem, 
          isSelected && { backgroundColor: activeColor, borderRadius: 14, shadowColor: activeColor, shadowOpacity: 0.3, shadowRadius: 5 }
        ]}
      >
        <Text style={[styles.dayName, { color: isSelected ? "#FFF" : colors.textSub }]}>
          {format(item, "EEE", { locale: fr })}
        </Text>
        <Text style={[styles.dayNum, { color: isSelected ? "#FFF" : colors.textMain }]}>
          {format(item, "dd")}
        </Text>
        {isSelected && <View style={styles.activeDot} />}
      </TouchableOpacity>
    );
  };

  const renderEvent = ({ item }: { item: Hearing }) => {
    const timeStr = format(parseISO(item.date), "HH:mm");
    
    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        // Navigation vers le détail du dossier (si l'avocat y a accès)
        onPress={() => navigation.navigate('LawyerCaseDetail', { caseId: item.caseId })}
        style={[
            styles.eventCard, 
            { backgroundColor: colors.bgCard, borderColor: colors.border }
        ]}
      >
        <View style={[styles.timeBox, { borderRightColor: colors.border }]}>
          <Text style={[styles.timeText, { color: colors.textMain }]}>{timeStr}</Text>
          <View style={[styles.typeBadge, { backgroundColor: activeColor + "15" }]}>
            <Text style={[styles.typeText, { color: activeColor }]}>
              {item.type === 'verdict' ? 'DÉLIBÉRÉ' : 'AUDIENCE'}
            </Text>
          </View>
        </View>
        
        <View style={styles.eventInfo}>
          <Text style={styles.clientLabel}>Affaire / Client</Text>
          <Text style={[styles.clientName, { color: colors.textMain }]} numberOfLines={1}>
            {item.parties || "Client Confidentiel"}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={colors.textSub} />
            <Text style={[styles.roomText, { color: colors.textSub }]}>
                {item.room || "Salle d'audience"}
            </Text>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={18} color={colors.border} />
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Agenda du Cabinet" showBack={false} showMenu={true} />
      
      <View style={[styles.mainWrapper, { backgroundColor: colors.bgMain }]}>
        {/* Sélecteur de date horizontal */}
        <View style={[styles.strip, { backgroundColor: colors.bgStrip, borderBottomColor: colors.border }]}>
          <FlatList
            horizontal
            data={weekDays}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.toISOString()}
            renderItem={renderDateItem}
            contentContainerStyle={styles.stripContent}
          />
        </View>

        {isLoading ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={activeColor} />
            </View>
        ) : (
            <FlatList
            data={dailyEvents}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={renderEvent}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={activeColor} />
            }
            ListHeaderComponent={
                <Text style={[styles.sectionTitle, { color: colors.textSub }]}>
                {format(selectedDate, "eeee dd MMMM yyyy", { locale: fr })}
                </Text>
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={60} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucune audience prévue ce jour.</Text>
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
  mainWrapper: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  strip: { 
    paddingVertical: 20, 
    borderBottomWidth: 1, 
  },
  stripContent: { paddingHorizontal: 15 },
  dateItem: { 
    width: 55, 
    height: 70, 
    alignItems: "center", 
    justifyContent: "center", 
    marginHorizontal: 5 
  },
  dayName: { fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  dayNum: { fontSize: 20, fontWeight: "900", marginTop: 2 },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#FFF", marginTop: 4 },

  listContent: { padding: 20, paddingBottom: 140 },
  sectionTitle: { 
    fontSize: 13, 
    fontWeight: "900", 
    textTransform: "uppercase", 
    marginBottom: 20, 
    letterSpacing: 1 
  },

  eventCard: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 20, 
    borderRadius: 24, 
    marginBottom: 15, 
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" }
    })
  },
  timeBox: { width: 85, paddingRight: 15, borderRightWidth: 1, alignItems: "flex-start" },
  timeText: { fontSize: 18, fontWeight: "900" },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
  typeText: { fontSize: 8, fontWeight: "900" },

  eventInfo: { flex: 1, paddingLeft: 20 },
  clientLabel: { fontSize: 9, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase" },
  clientName: { fontSize: 16, fontWeight: "800", marginBottom: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  roomText: { fontSize: 12, fontWeight: "600" },

  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { textAlign: "center", marginTop: 15, fontWeight: "600" }
});