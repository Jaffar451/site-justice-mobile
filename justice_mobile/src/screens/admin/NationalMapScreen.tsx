import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  TouchableOpacity, 
  Text,
  Platform,
  Linking,
  ScrollView,
  StatusBar,
  Dimensions // ✅ Import nécessaire
} from 'react-native';
import { Map, Marker, ZoomControl } from "pigeon-maps"; 
import { Ionicons } from '@expo/vector-icons';

// ✅ Imports Architecture & Thème
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import { useAppTheme } from '../../theme/AppThemeProvider';

// Données géolocalisées sur Niamey
const MOCK_STATIONS = [
  { id: 1, name: "Commissariat Central", type: "POLICE", city: "Niamey", latitude: 13.5160, longitude: 2.1120, address: "Avenue de la République" },
  { id: 2, name: "Brigade Fluviale", type: "GENDARMERIE", city: "Niamey", latitude: 13.5060, longitude: 2.1020, address: "Rive Droite" },
  { id: 3, name: "Tribunal de Grande Instance", type: "TRIBUNAL", city: "Niamey", latitude: 13.5136, longitude: 2.1098, address: "Quartier Plateau" },
  { id: 4, name: "Commissariat 4ème Arr", type: "POLICE", city: "Niamey", latitude: 13.5250, longitude: 2.1400, address: "Nouveau Marché" },
];

const NIAMEY_CENTER: [number, number] = [13.51366, 2.1098];
const { height: screenHeight } = Dimensions.get('window'); // ✅ Calcul hauteur écran

export default function NationalMapScreen() {
  const { theme, isDark } = useAppTheme();
  
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"TOUT" | "POLICE" | "GENDARMERIE" | "TRIBUNAL">("TOUT");
  
  const [center, setCenter] = useState<[number, number]>(NIAMEY_CENTER);
  const [zoom, setZoom] = useState(13);
  const [selectedStation, setSelectedStation] = useState<any>(null);

  const primaryColor = theme.colors.primary;

  // Hauteur dynamique de la carte (Ecran total - Header - Marges)
  const mapHeight = screenHeight - 120; 

  useEffect(() => { loadMarkers(); }, []);

  const loadMarkers = async () => {
    try {
      setTimeout(() => setStations(MOCK_STATIONS), 800);
    } catch (e) {
      console.error("Erreur cartographie:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredStations = stations.filter(s => filter === "TOUT" || s.type === filter);

  const getPinConfig = (type: string) => {
    switch (type) {
      case 'POLICE': return { color: '#3B82F6', icon: 'shield' };
      case 'GENDARMERIE': return { color: '#10B981', icon: 'star' };
      case 'TRIBUNAL': return { color: '#8B5CF6', icon: 'business' };
      default: return { color: '#EF4444', icon: 'location' };
    }
  };

  const handleItinerary = () => {
    if (!selectedStation) return;
    
    const lat = selectedStation.latitude;
    const lng = selectedStation.longitude;
    const label = selectedStation.name;

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    });

    if (url) Linking.openURL(url);
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Maillage Territorial" showBack />
      
      <View style={[styles.mainWrapper, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
        {loading ? (
          <View style={styles.loaderContainer}>
             <ActivityIndicator color={primaryColor} size="large" />
             <Text style={[styles.loadingText, { color: isDark ? "#94A3B8" : "#64748B" }]}>Chargement du cadastre...</Text>
          </View>
        ) : (
          <View style={styles.mapContainer}>
            
            {/* 🗺️ LA CARTE */}
            <Map 
              height={mapHeight} // ✅ Correction ici : on passe un nombre, pas une string
              center={center} 
              zoom={zoom}
              onBoundsChanged={({ center, zoom }) => { setCenter(center); setZoom(zoom); }}
            >
              <ZoomControl />
              {filteredStations.map((station) => {
                const config = getPinConfig(station.type);
                return (
                  <Marker 
                    key={station.id} 
                    width={40} 
                    anchor={[station.latitude, station.longitude]} 
                    onClick={() => {
                        setSelectedStation(station);
                        setCenter([station.latitude, station.longitude]);
                        setZoom(15);
                    }}
                  >
                    <View style={[styles.markerBadge, { backgroundColor: config.color, borderColor: isDark ? "#0F172A" : "#FFF" }]}>
                        <Ionicons name={config.icon as any} size={18} color="#FFF" />
                    </View>
                  </Marker>
                );
              })}
            </Map>

            {/* 🏷️ FILTRES FLOTTANTS */}
            <View style={styles.filterOverlay}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {(["TOUT", "POLICE", "GENDARMERIE", "TRIBUNAL"] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.9}
                    style={[
                      styles.filterChip,
                      filter === cat 
                        ? { backgroundColor: primaryColor, borderColor: primaryColor }
                        : { backgroundColor: isDark ? "#1E293B" : "#FFF", borderColor: isDark ? "#334155" : "#E2E8F0" }
                    ]}
                    onPress={() => {
                        setFilter(cat);
                        setSelectedStation(null);
                    }}
                  >
                    <Text style={[styles.filterText, { color: filter === cat ? "#FFF" : (isDark ? "#CBD5E1" : "#64748B") }]}>
                      {cat === "TOUT" ? "Tous" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 🎯 BOUTON RECENTRER */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.recentreFab, { backgroundColor: isDark ? "#1E293B" : "#FFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              onPress={() => {
                  setCenter(NIAMEY_CENTER);
                  setZoom(13);
              }}
            >
                <Ionicons name="locate-outline" size={26} color={primaryColor} />
            </TouchableOpacity>

            {/* ℹ️ CARTE D'INFO */}
            {selectedStation && (
                <View style={[styles.infoCard, { backgroundColor: isDark ? "#1E293B" : "#FFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                    <View style={styles.infoHeader}>
                        <View>
                            <Text style={[styles.infoTitle, { color: isDark ? "#FFF" : "#1E293B" }]}>{selectedStation.name}</Text>
                            <Text style={{ color: getPinConfig(selectedStation.type).color, fontSize: 10, fontWeight: '800' }}>
                                {selectedStation.type}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedStation(null)} style={{ padding: 5 }}>
                            <Ionicons name="close-circle" size={24} color={isDark ? "#94A3B8" : "#CBD5E1"} />
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={[styles.infoAddress, { color: isDark ? "#94A3B8" : "#64748B" }]}>
                        {selectedStation.address}, {selectedStation.city}
                    </Text>

                    <TouchableOpacity 
                        style={[styles.itineraryBtn, { backgroundColor: primaryColor }]}
                        onPress={handleItinerary}
                    >
                        <Ionicons name="navigate" size={16} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.itineraryText}>LANCER L'ITINÉRAIRE</Text>
                    </TouchableOpacity>
                </View>
            )}

          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  mapContainer: { flex: 1, position: 'relative' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 15 },
  loadingText: { fontSize: 13, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  
  markerBadge: {
    width: 36, height: 36, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2,
    ...Platform.select({
       android: { elevation: 4 },
       web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.2)', cursor: 'pointer' }
    })
  },

  filterOverlay: { position: 'absolute', top: 20, left: 0, right: 0, zIndex: 10 },
  filterScroll: { paddingHorizontal: 16 },
  filterChip: { 
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginRight: 10,
    ...Platform.select({
        android: { elevation: 3 },
        ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4 },
        web: { boxShadow: '0px 2px 5px rgba(0,0,0,0.1)' }
    })
  },
  filterText: { fontWeight: '700', fontSize: 12 },

  recentreFab: { 
    position: 'absolute', bottom: 180, right: 20, 
    width: 50, height: 50, borderRadius: 16, 
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
    ...Platform.select({
        android: { elevation: 5 },
        ios: { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 5 },
        web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.15)' }
    })
  },

  infoCard: {
      position: 'absolute', bottom: 30, left: 20, right: 20,
      padding: 20, borderRadius: 24, borderWidth: 1,
      ...Platform.select({
        android: { elevation: 10 },
        ios: { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 15, shadowOffset: { width: 0, height: 5 } },
        web: { boxShadow: '0px 10px 25px rgba(0,0,0,0.15)' }
      })
  },
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoTitle: { fontSize: 16, fontWeight: '900', marginBottom: 2 },
  infoAddress: { fontSize: 13, marginTop: 8, marginBottom: 20, lineHeight: 18 },
  itineraryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14 },
  itineraryText: { color: '#FFF', fontWeight: '900', fontSize: 12, letterSpacing: 1 }
});