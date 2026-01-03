import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../../theme/AppThemeProvider";
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";

const MOCK_NOTIFS = [
  { id: "1", title: "Avis d'audience", body: "L'affaire RG #101 a été fixée au 15/01/2026.", date: "Il y a 2h", type: "calendar" },
  { id: "2", title: "Nouvelle pièce versée", body: "Le Procureur a versé un rapport d'expertise (RG #104).", date: "Il y a 5h", type: "document" },
  { id: "3", title: "Décision rendue", body: "L'ordonnance de renvoi a été signée pour le dossier #109.", date: "Hier", type: "judge" },
];

export default function LawyerNotificationsScreen() {
  const { theme, isDark } = useAppTheme();

  return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Notifications" showBack />
      
      <FlatList
        data={MOCK_NOTIFS}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.notifCard, { backgroundColor: isDark ? "#1E1E1E" : "#FFF", borderBottomColor: isDark ? "#333" : "#F1F5F9" }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + "15" }]}>
              <Ionicons name={item.type === "calendar" ? "calendar" : "notifications"} size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={[styles.notifTitle, { color: theme.colors.text }]}>{item.title}</Text>
              <Text style={[styles.notifBody, { color: theme.colors.textSecondary }]}>{item.body}</Text>
              <Text style={styles.notifDate}>{item.date}</Text>
            </View>
            <View style={styles.unreadDot} />
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  notifCard: { flexDirection: "row", paddingVertical: 18, borderBottomWidth: 1, alignItems: "center" },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, justifyContent: "center", alignItems: "center" },
  notifTitle: { fontSize: 15, fontWeight: "800" },
  notifBody: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  notifDate: { fontSize: 11, color: "#94A3B8", marginTop: 6, fontWeight: "600" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444", marginLeft: 10 }
});