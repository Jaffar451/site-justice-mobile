import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

interface NotificationBadgeProps {
  count: number;
}

export default function NotificationBadge({ count }: NotificationBadgeProps) {
  // 1. Ne rien afficher si le compteur est à zéro
  if (!count || count <= 0) return null;

  // 2. Formater le texte pour les grands nombres (évite de casser le cercle)
  const displayCount = count > 9 ? "9+" : count;

  return (
    <View style={styles.badge}>
      <Text style={styles.countText}>
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#FF3B30", // Rouge standard iOS
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -4,
    right: -8,
    // Bordure fine pour détacher le badge du fond (surtout sur fond de couleur)
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    zIndex: 100,
    // Ombre légère pour le relief
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  countText: { 
    color: "white", 
    fontSize: 9, 
    fontWeight: "800",
    textAlign: "center",
    // Correction optique du centrage sur certaines polices
    marginTop: -1, 
  },
});