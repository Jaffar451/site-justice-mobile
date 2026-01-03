import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, ScrollView, Platform, Dimensions, StatusBar } from "react-native";
import { Map, Marker, ZoomControl } from "pigeon-maps"; 

// ✅ Architecture & Thème
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { Ionicons } from "@expo/vector-icons";

// Configuration Géo Niger (Niamey)
const NIAMEY_CENTER: [number, number] = [13.51366, 2.1098];

interface JusticeLocation {
  id: number;
  name: string;
  type: "court" | "police" | "prison";
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  status: "online" | "offline";
}

const MOCK_LOCATIONS: JusticeLocation[] = [
  { id: 1, name: "Tribunal de Grande Instance HC", type: "court", latitude: 13.51366, longitude: 2.1098, address: "Quartier Plateau, Niamey", city: "Niamey", status: "online" },
  { id: 2, name: "Commissariat Central", type: "police", latitude: 13.5160, longitude: 2.1120, address: "Rond-point de la Liberté", city: "Niamey", status: "online" },
  { id: 3, name: "Maison d'Arrêt Civile", type: "prison", latitude: 13.5300, longitude: 2.0900, address: "Route de Ouallam", city: "Niamey", status: "offline" },
  { id: 4, name: "Cour d'Appel de Niamey", type: "court", latitude: 13.5100, longitude: 2.1050, address: "Avenue de l'Afrique", city: "Niamey", status: "online" },
];

export default function NationalMapScreen() {
  const { theme, isDark } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<JusticeLocation[]>([]);
  const [selected, setSelected] = useState<JusticeLocation | null>(null);

  const [center, setCenter] = useState<[number, number]>(NIAMEY_CENTER);
  const [zoom, setZoom] = useState(13);

  // Couleurs dynamiques
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgSidebar: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocations(MOCK_LOCATIONS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleMarkerClick = useCallback((loc: JusticeLocation) => {
    setSelected(loc);
    setCenter([loc.latitude, loc.longitude]);
    setZoom(16);
  }, []);

  const getIconConfig = (type: string) => {
    switch(type) {
      case 'court': return { color: '#7C3AED', icon: 'business-outline' };
      case 'police': return { color: '#2563EB', icon: 'shield-outline' };
      case 'prison': return { color: '#DC2626', icon: 'lock-closed-outline' };
      default: return { color: '#64748B', icon: 'location-outline' };
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Maillage Territorial Niger" showBack />
      
      <View style={[styles.layout, { flexDirection: Platform.OS === 'web' && Dimensions.get('window').width > 768 ? 'row' : 'column', backgroundColor: colors.bgMain }]}>
        
        {/* 🗺️ ZONE CARTE (SIG INTERACTIF) */}
        <View style={styles.mapWrapper}>
          {loading ? (
            <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loaderText, { color: theme.colors.primary }]}>Synchronisation des nœuds judiciaires...</Text>
            </View>
          ) : (
            <Map 
              height={Platform.OS === 'web' ? undefined : 350} 
              center={center} 
              zoom={zoom}
              onBoundsChanged={({ center, zoom }) => { setCenter(center); setZoom(zoom); }}
              // Filtre gris pour le mode sombre sur les tuiles OSM
              boxClassname={isDark ? "dark-map" : ""}
            >
              <ZoomControl />
              {locations.map((loc) => (
                <Marker 
                  key={loc.id} 
                  width={40} 
                  anchor={[loc.latitude, loc.longitude]} 
                  onClick={() => handleMarkerClick(loc)}
                >
                  <View style={[styles.markerContainer, { backgroundColor: getIconConfig(loc.type).color, borderColor: isDark ? "#0F172A" : "#FFF" }]}>
                    <Ionicons name={getIconConfig(loc.type).icon as any} size={18} color="#FFF" />
                  </View>
                </Marker>
              ))}
            </Map>
          )}
        </View>

        {/* 📋 BARRE LATÉRALE / INFOS UNITÉS */}
        <View style={[styles.sidebar, { 
          backgroundColor: colors.bgSidebar,
          borderLeftWidth: Platform.OS === 'web' ? 1 : 0,
          borderTopWidth: Platform.OS === 'web' ? 0 : 1,
          borderColor: colors.border
        }]}>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarContent}>
            <Text style={[styles.sidebarTitle, { color: colors.textMain }]}>Inventaire National</Text>
            <Text style={[styles.sidebarSub, { color: colors.textSub }]}>{locations.length} points de présence identifiés</Text>

            {selected ? (
              <View style={[styles.detailCard, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.typeIcon, { backgroundColor: getIconConfig(selected.type).color }]}>
                    <Ionicons name={getIconConfig(selected.type).icon as any} size={24} color="#FFF" />
                  </View>
                  <TouchableOpacity onPress={() => setSelected(null)} style={[styles.closeCircle, { backgroundColor: colors.border }]}>
                    <Ionicons name="close" size={16} color={colors.textMain} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.cardName, { color: colors.textMain }]}>{selected.name}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: getIconConfig(selected.type).color + '20' }]}>
                    <Text style={[styles.badgeText, { color: getIconConfig(selected.type).color }]}>{selected.type.toUpperCase()}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <View style={[styles.onlineDot, { backgroundColor: selected.status === 'online' ? '#10B981' : '#94A3B8' }]} />
                    <Text style={[styles.statusText, { color: selected.status === 'online' ? '#10B981' : '#94A3B8' }]}>
                        {selected.status === 'online' ? 'RÉSEAU OK' : 'HORS LIGNE'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.addressBlock, { backgroundColor: colors.bgSidebar }]}>
                  <Text style={styles.addressLabel}>RESSORT JUDICIAIRE</Text>
                  <Text style={[styles.addressText, { color: colors.textMain }]}>{selected.address}</Text>
                  <Text style={[styles.cityText, { color: colors.textSub }]}>{selected.city}, Niger</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnText}>AUDITER L'UNITÉ</Text>
                  <Ionicons name="shield-checkmark" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIconBox, { backgroundColor: colors.bgMain }]}>
                  <Ionicons name="layers-outline" size={32} color={colors.textSub} />
                </View>
                <Text style={[styles.emptyText, { color: colors.textSub }]}>
                  Sélectionnez une entité pour visualiser ses statistiques de traitement et son état de connexion.
                </Text>
                
                <Text style={[styles.listSectionTitle, { color: colors.textSub }]}>ENTITÉS À PROXIMITÉ</Text>
                {locations.map(loc => (
                  <TouchableOpacity 
                    key={loc.id} 
                    style={[styles.listItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleMarkerClick(loc)}
                  >
                    <View style={[styles.miniDot, { backgroundColor: getIconConfig(loc.type).color }]} />
                    <Text style={[styles.listItemText, { color: colors.textMain }]} numberOfLines={1}>{loc.name}</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.textSub} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  layout: { flex: 1 },
  mapWrapper: { flex: 7, minHeight: 350 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loaderText: { marginTop: 15, fontWeight: "800", fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' },

  markerContainer: {
    width: 34, height: 34, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2,
    ...Platform.select({
      web: { cursor: 'pointer', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' },
      android: { elevation: 4 }
    })
  },

  sidebar: { flex: 4 },
  sidebarContent: { padding: 24, paddingBottom: 100 },
  sidebarTitle: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  sidebarSub: { fontSize: 12, fontWeight: "600", marginTop: 4, marginBottom: 20 },

  detailCard: { borderRadius: 24, padding: 20, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  typeIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  closeCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  cardName: { fontSize: 17, fontWeight: '900', marginBottom: 10, lineHeight: 22 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 25 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '800' },

  addressBlock: { padding: 16, borderRadius: 16, marginBottom: 20 },
  addressLabel: { fontSize: 9, fontWeight: '900', color: '#94A3B8', marginBottom: 8, letterSpacing: 1 },
  addressText: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  cityText: { fontSize: 12, marginTop: 4, fontWeight: '600' },

  actionBtn: { 
    flexDirection: 'row', height: 52, borderRadius: 14, 
    justifyContent: 'center', alignItems: 'center', gap: 10 
  },
  actionBtnText: { color: '#FFF', fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  emptyState: { alignItems: 'center' },
  emptyIconBox: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyText: { textAlign: 'center', fontSize: 13, lineHeight: 20, paddingHorizontal: 10, fontWeight: '500' },

  listSectionTitle: { alignSelf: 'flex-start', fontSize: 10, fontWeight: '900', marginTop: 35, marginBottom: 12, letterSpacing: 1.5 },
  listItem: { 
    flexDirection: 'row', alignItems: 'center', paddingVertical: 15, 
    borderBottomWidth: 1, width: '100%' 
  },
  miniDot: { width: 8, height: 8, borderRadius: 4, marginRight: 15 },
  listItemText: { flex: 1, fontSize: 13, fontWeight: '700' }
});