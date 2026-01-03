import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  StatusBar,
  Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, startOfToday, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

// ✅ 1. Imports Architecture
import { getAppTheme } from "../../theme";
import { LawyerScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

const MOCK_LAW_EVENTS = [
  { id: "1", time: "09:00", type: "Plaidoirie", client: "Sani Maïga", room: "Chambre Correctionnelle 1", caseId: 101 },
  { id: "2", time: "11:30", type: "Délibéré", client: "Entreprise SONILAZ", room: "Cabinet du Juge", caseId: 104 },
  { id: "3", time: "15:00", type: "Audience", client: "Fatima Z.", room: "Tribunal de Commerce", caseId: 109 },
];

export default function LawyerCalendarScreen({ navigation }: LawyerScreenProps<'LawyerCalendar'>) {
  // ✅ 2. Thème via Helper (Noir & Or pour Avocats)
  const theme = getAppTheme();
  const primaryColor = theme.color;

  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const weekDays = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));

  const renderDateItem = ({ item }: { item: Date }) => {
    const isSelected = isSameDay(item, selectedDate);
    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => setSelectedDate(item)}
        style={[
          styles.dateItem, 
          isSelected && { backgroundColor: primaryColor, borderRadius: 14 }
        ]}
      >
        <Text style={[styles.dayName, { color: isSelected ? "#FFF" : "#94A3B8" }]}>
          {format(item, "EEE", { locale: fr })}
        </Text>
        <Text style={[styles.dayNum, { color: isSelected ? "#FFF" : "#1E293B" }]}>
          {format(item, "dd")}
        </Text>
        {isSelected && <View style={styles.activeDot} />}
      </TouchableOpacity>
    );
  };

  const renderEvent = ({ item }: { item: typeof MOCK_LAW_EVENTS[0] }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => {}} // Navigation vers détail dossier
      style={[styles.eventCard, { backgroundColor: "#FFF", borderColor: "#F1F5F9" }]}
    >
      <View style={[styles.timeBox, { borderRightColor: "#F1F5F9" }]}>
        <Text style={styles.timeText}>{item.time}</Text>
        <View style={[styles.typeBadge, { backgroundColor: primaryColor + "15" }]}>
          <Text style={[styles.typeText, { color: primaryColor }]}>
            {item.type.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.eventInfo}>
        <Text style={styles.clientLabel}>Client</Text>
        <Text style={styles.clientName}>{item.client}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color="#64748B" />
          <Text style={styles.roomText}>{item.room}</Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Agenda du Cabinet" showBack />
      
      <View style={styles.mainWrapper}>
        {/* Sélecteur de date horizontal */}
        <View style={styles.strip}>
          <FlatList
            horizontal
            data={weekDays}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.toISOString()}
            renderItem={renderDateItem}
            contentContainerStyle={styles.stripContent}
          />
        </View>

        <FlatList
          data={MOCK_LAW_EVENTS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderEvent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {format(selectedDate, "eeee dd MMMM", { locale: fr })}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={60} color="#E2E8F0" />
              <Text style={styles.emptyText}>Aucune audience prévue ce jour.</Text>
            </View>
          }
        />
      </View>

      {/* ✅ SmartFooter autonome */}
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: "#F8FAFC" },
  strip: { 
    paddingVertical: 20, 
    backgroundColor: "#FFF", 
    borderBottomWidth: 1, 
    borderBottomColor: "#F1F5F9" 
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

  listContent: { padding: 20, paddingBottom: 120 },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: "900", 
    color: "#64748B", 
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
      android: { elevation: 2 }
    })
  },
  timeBox: { width: 85, paddingRight: 15, borderRightWidth: 1, alignItems: "flex-start" },
  timeText: { fontSize: 18, fontWeight: "900", color: "#1E293B" },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
  typeText: { fontSize: 8, fontWeight: "900" },

  eventInfo: { flex: 1, paddingLeft: 20 },
  clientLabel: { fontSize: 9, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase" },
  clientName: { fontSize: 16, fontWeight: "800", color: "#1E293B", marginBottom: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  roomText: { fontSize: 12, color: "#64748B", fontWeight: "600" },

  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { textAlign: "center", marginTop: 15, color: "#94A3B8", fontWeight: "600" }
});