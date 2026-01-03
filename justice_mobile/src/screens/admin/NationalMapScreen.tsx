import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Dimensions, 
  ActivityIndicator, 
  TouchableOpacity, 
  Text,
  Platform,
  Linking,
  ScrollView,
  StatusBar
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// ✅ Imports Architecture & Thème
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import { useAppTheme } from '../../theme/AppThemeProvider';

// Données fictives géolocalisées sur Niamey
const MOCK_STATIONS = [
  { id: 1, name: "Commissariat Central", type: "POLICE", city: "Niamey", latitude: 13.5160, longitude: 2.1120, address: "Avenue de la République" },
  { id: 2, name: "Brigade Fluviale", type: "GENDARMERIE", city: "Niamey", latitude: 13.5060, longitude: 2.1020, address: "Rive Droite" },
  { id: 3, name: "Tribunal de Grande Instance", type: "TRIBUNAL", city: "Niamey", latitude: 13.5136, longitude: 2.1098, address: "Quartier Plateau" },
  { id: 4, name: "Commissariat 4ème Arr", type: "POLICE", city: "Niamey", latitude: 13.5250, longitude: 2.1400, address: "Nouveau Marché" },
];

const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
];

export default function NationalMapScreen() {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"TOUT" | "POLICE" | "GENDARMERIE" | "TRIBUNAL">("TOUT");

  const primaryColor = theme.colors.primary;

  const INITIAL_REGION = {
    latitude: 13.51366,
    longitude: 2.1098,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  };

  useEffect(() => { loadMarkers(); }, []);

  const loadMarkers = async () => {
    try {
      // Simulation appel API e-Justice
      setTimeout(() => setStations(MOCK_STATIONS), 1000);
    } catch (e) {
      console.error("Erreur cartographie:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredStations = stations.filter(s => filter === "TOUT" || s.type === filter);

  const getPinColor = (type: string) => {
    switch (type) {
      case 'POLICE': return '#3B82F6'; // Bleu
      case 'GENDARMERIE': return '#10B981'; // Vert
      case 'TRIBUNAL': return '#8B5CF6'; // Violet
      default: return '#EF4444';
    }
  };

  const handleItinerary = (lat: number, lng: number, label: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      web: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
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
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={INITIAL_REGION}
              customMapStyle={isDark ? DARK_MAP_STYLE : []}
              showsUserLocation={true}
              showsCompass={true}
              rotateEnabled={false}
              toolbarEnabled={false}
            >
              {filteredStations.map((station) => (
                <Marker
                  key={station.id}
                  coordinate={{ latitude: station.latitude, longitude: station.longitude }}
                  pinColor={getPinColor(station.type)}
                >
                  <Callout tooltip onPress={() => handleItinerary(station.latitude, station.longitude, station.name)}>
                    <View style={[styles.calloutCard, { backgroundColor: isDark ? "#1E293B" : "#FFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                      <Text style={[styles.calloutTitle, { color: isDark ? "#FFF" : "#1E293B" }]}>{station.name}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: getPinColor(station.type) + '20' }]}>
                        <Text style={[styles.typeBadgeText, { color: getPinColor(station.type) }]}>{station.type}</Text>
                      </View>
                      <Text style={[styles.calloutSub, { color: isDark ? "#94A3B8" : "#64748B" }]}>{station.city}</Text>
                      <View style={[styles.calloutBtn, { backgroundColor: primaryColor }]}>
                          <Ionicons name="navigate-outline" size={14} color="#FFF" />
                          <Text style={styles.calloutBtnText}>ITINÉRAIRE</Text>
                      </View>
                    </View>
                  </Callout>
                </Marker>
              ))}
            </MapView>

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
                    onPress={() => setFilter(cat)}
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
              onPress={() => mapRef.current?.animateToRegion(INITIAL_REGION, 1000)}
            >
                <Ionicons name="locate-outline" size={26} color={primaryColor} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  mapContainer: { flex: 1, position: 'relative' },
  map: { width: '100%', height: '100%' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 15 },
  loadingText: { fontSize: 13, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  
  // Callout Styles
  calloutCard: { 
    padding: 16, 
    borderRadius: 24, 
    width: 200, 
    alignItems: 'center',
    borderWidth: 1.5,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10 },
        android: { elevation: 5 }
    })
  },
  calloutTitle: { fontWeight: '900', fontSize: 14, marginBottom: 6, textAlign: 'center' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginBottom: 8 },
  typeBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  calloutSub: { fontSize: 12, marginBottom: 12, fontWeight: '600' },
  calloutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 14, 
    gap: 8 
  },
  calloutBtnText: { color: '#FFF', fontSize: 11, fontWeight: '900' },

  // Overlays
  filterOverlay: { position: 'absolute', top: 20, left: 0, right: 0, zIndex: 10 },
  filterScroll: { paddingHorizontal: 16 },
  filterChip: { 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 16, 
    borderWidth: 1.5, 
    marginRight: 10,
    ...Platform.select({
        android: { elevation: 4 },
        ios: { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } }
    })
  },
  filterText: { fontWeight: '900', fontSize: 12 },

  recentreFab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 20, 
    width: 60, 
    height: 60, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1.5,
    ...Platform.select({
        android: { elevation: 8 },
        ios: { shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: {width: 0, height: 5} }
    })
  }
});