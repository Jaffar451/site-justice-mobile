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

// ✅ 1. Imports Architecture
import { useAppTheme } from "../../theme/AppThemeProvider";
import { LawyerScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Données fictives enrichies (avec caseId pour la navigation)
const MOCK_NOTIFS = [
  { 
    id: "1", 
    title: "Avis d'audience", 
    body: "L'affaire RG #101 (Client: S. Maïga) a été fixée au 15/01/2026 à 09h00.", 
    date: "Il y a 2h", 
    type: "calendar",
    caseId: 101,
    read: false
  },
  { 
    id: "2", 
    title: "Nouvelle pièce versée", 
    body: "Le Procureur a versé un rapport d'expertise balistique dans le dossier RG #104.", 
    date: "Il y a 5h", 
    type: "document",
    caseId: 104,
    read: true
  },
  { 
    id: "3", 
    title: "Décision rendue", 
    body: "L'ordonnance de renvoi a été signée pour le dossier #109. Vous pouvez la consulter.", 
    date: "Hier", 
    type: "judge",
    caseId: 109,
    read: true
  },
  { 
    id: "4", 
    title: "Facturation", 
    body: "Le paiement des honoraires pour l'affaire #102 a été validé.", 
    date: "Hier", 
    type: "money",
    caseId: 102,
    read: true
  },
];

export default function LawyerNotificationsScreen({ navigation }: LawyerScreenProps<'Notifications'>) {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  // Couleur Or pour l'avocat
  const primaryColor = isDark ? "#D4AF37" : theme.colors.primary; 

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    iconBg: isDark ? "#1E293B" : "#F1F5F9",
    unreadDot: "#EF4444",
  };

  const getIconConfig = (type: string) => {
    switch (type) {
        case 'calendar': return { name: "calendar", color: "#F59E0B" };
        case 'document': return { name: "document-text", color: "#3B82F6" };
        case 'judge': return { name: "gavel", color: "#EF4444" };
        case 'money': return { name: "card", color: "#10B981" };
        default: return { name: "notifications", color: primaryColor };
    }
  };

  const handlePressNotification = (item: typeof MOCK_NOTIFS[0]) => {
    if (item.caseId) {
        // Navigation vers le détail du dossier
        navigation.navigate("LawyerCaseDetail", { caseId: item.caseId });
    }
  };

  const renderItem = ({ item }: { item: typeof MOCK_NOTIFS[0] }) => {
    const iconConfig = getIconConfig(item.type);

    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        style={[
            styles.notifCard, 
            { 
                backgroundColor: colors.bgCard, 
                borderBottomColor: colors.border,
                opacity: item.read ? 0.7 : 1
            }
        ]}
        onPress={() => handlePressNotification(item)}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconConfig.color + "15" }]}>
          <Ionicons name={iconConfig.name as any} size={20} color={iconConfig.color} />
        </View>
        
        <View style={{ flex: 1, marginLeft: 15 }}>
          <View style={styles.headerRow}>
             <Text style={[styles.notifTitle, { color: colors.textMain }]}>{item.title}</Text>
             {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.unreadDot }]} />}
          </View>
          
          <Text style={[styles.notifBody, { color: colors.textSub }]} numberOfLines={2}>
              {item.body}
          </Text>
          <Text style={[styles.notifDate, { color: colors.textSub }]}>{item.date}</Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color={colors.border} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Centre de Notifications" showBack />
      
      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <FlatList
            data={MOCK_NOTIFS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
                <View style={styles.listHeader}>
                    <Text style={[styles.headerTitle, { color: colors.textSub }]}>RÉCENTES</Text>
                    <TouchableOpacity>
                        <Text style={[styles.markReadText, { color: primaryColor }]}>Tout marquer comme lu</Text>
                    </TouchableOpacity>
                </View>
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="notifications-off-outline" size={60} color={colors.border} />
                    <Text style={[styles.emptyText, { color: colors.textSub }]}>
                        Vous n'avez aucune nouvelle notification.
                    </Text>
                </View>
            }
        />
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 0 },
  listHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    paddingVertical: 15 
  },
  headerTitle: { fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  markReadText: { fontSize: 12, fontWeight: "700" },

  notifCard: { 
    flexDirection: "row", 
    paddingVertical: 18, 
    paddingHorizontal: 20,
    borderBottomWidth: 1, 
    alignItems: "center" 
  },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { fontSize: 15, fontWeight: "800", flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 10 },
  
  notifBody: { fontSize: 13, marginTop: 4, lineHeight: 20, fontWeight: "500" },
  notifDate: { fontSize: 11, marginTop: 8, fontWeight: "600", fontStyle: 'italic' },
  
  emptyContainer: { alignItems: "center", marginTop: 100, paddingHorizontal: 40 },
  emptyText: { textAlign: "center", marginTop: 15, fontWeight: "600" }
});