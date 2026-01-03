import React, { useEffect, useState, useMemo, useRef } from 'react';
import { StyleSheet, View, Alert, Linking, Platform, StatusBar } from 'react-native';
import { Text, Button, Card, IconButton, Avatar, Searchbar } from 'react-native-paper';
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Imports Architecture
import { CitizenScreenProps } from '../../types/navigation';
import { useAppTheme } from '../../theme/AppThemeProvider';

// Composants
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';

// Services
import { getAllStations, PoliceStation } from '../../services/policeStation.service';

// ✅ 2. Import Dynamique de MapView (Évite le crash Web)
let MapView: any;
let Marker: any;
let PROVIDER_GOOGLE: any;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

interface ValidStation extends PoliceStation {
  latitude: number;
  longitude: number;
}

// ✅ Ajout de la prop navigation pour la redirection
export default function StationMapScreen({ navigation }: CitizenScreenProps<'StationMapScreen'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const mapRef = useRef<any>(null);

  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<ValidStation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const NIAMEY_REGION = {
    latitude: 13.5127,
    longitude: 2.1128,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  // 🎨 Palette dynamique
  const searchBarBg = isDark ? '#1E293B' : '#FFFFFF';
  const searchBarText = isDark ? '#FFFFFF' : '#1E293B';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const cardText = isDark ? '#FFFFFF' : '#1E293B';
  const cardSubText = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : 'rgba(0,0,0,0.05)';

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const data = await getAllStations();
      setStations(Array.isArray(data) ? data : []);
    } catch (e) {
      if (Platform.OS !== 'web') Alert.alert("Erreur", "Impossible de charger la carte.");
    }
  };

  const filteredStations = useMemo(() => {
    return stations.filter((s): s is ValidStation => {
      const hasCoords = typeof s.latitude === 'number' && typeof s.longitude === 'number';
      const query = searchQuery.toLowerCase().trim();
      if (!hasCoords) return false;
      if (!query) return s.status === 'active';
      return (s.name?.toLowerCase().includes(query) || s.city?.toLowerCase().includes(query));
    });
  }, [searchQuery, stations]);

  const handleSelectStation = (station: ValidStation) => {
    setSelectedStation(station);
    if (Platform.OS !== 'web' && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: station.latitude - 0.005,
        longitude: station.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }, 1000);
    }
  };

  const openInGmaps = (lat: number, lng: number, label: string) => {
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(label)}@${latLng}`,
      android: `geo:0,0?q=${latLng}(${encodeURIComponent(label)})`,
      web: `https://www.google.com/maps/search/?api=1&query=${latLng}`
    });
    if (url) Linking.openURL(url);
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Services Judiciaires" showBack />
      
      <View style={styles.mainWrapper}>
        {Platform.OS === 'web' ? (
          // 💻 AFFICHAGE WEB
          <View style={[styles.webPlaceholder, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
            <Ionicons name="map-outline" size={80} color={primaryColor} />
            <Text style={[styles.webTitle, { color: cardText }]}>Carte indisponible sur navigateur</Text>
            <Text style={[styles.webSub, { color: cardSubText }]}>
              La visualisation SIG nécessite l'application mobile pour Niger Justice.
            </Text>
            
            {/* ✅ MODIFICATION ICI : On utilise navigation.navigate au lieu de Linking.openURL */}
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('CitizenHome')} 
              style={{ marginTop: 20 }}
            >
              RETOUR À L'ACCUEIL
            </Button>
          </View>
        ) : (
          // 📱 AFFICHAGE MOBILE (MapView chargé dynamiquement)
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={NIAMEY_REGION}
            showsUserLocation={true}
            customMapStyle={isDark ? darkMapStyle : []}
            onPress={() => setSelectedStation(null)}
          >
            {filteredStations.map((station) => (
              <Marker
                key={station.id}
                coordinate={{ latitude: station.latitude, longitude: station.longitude }}
                onPress={() => handleSelectStation(station)}
              >
                <View style={[styles.markerContainer, { backgroundColor: station.type === 'GENDARMERIE' ? '#065F46' : '#1E3A8A' }]}>
                  <Ionicons name="shield-checkmark" size={16} color="white" />
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        {/* 🔍 BARRE DE RECHERCHE */}
        <View style={styles.searchOverlay}>
          <Searchbar
            placeholder="Rechercher une unité..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchbar, { backgroundColor: searchBarBg, borderColor: borderColor }]}
            inputStyle={{ color: searchBarText, fontSize: 14 }}
            iconColor={primaryColor}
            placeholderTextColor={isDark ? "#94A3B8" : "#64748B"}
          />
        </View>

        {/* 📋 FICHE DÉTAILLÉE */}
        {selectedStation && (
          <Card style={[styles.floatingCard, { backgroundColor: cardBg, borderColor: borderColor }]}>
            <Card.Title
              title={selectedStation.name}
              titleStyle={{ fontWeight: '900', color: cardText, fontSize: 15 }}
              subtitle={selectedStation.city}
              subtitleStyle={{ color: cardSubText }}
              right={(props) => <IconButton {...props} icon="close" onPress={() => setSelectedStation(null)} />}
            />
            <Card.Content>
               <Text style={{ color: cardSubText, fontSize: 12 }}>{selectedStation.address || "Adresse non spécifiée"}</Text>
            </Card.Content>
            <Card.Actions>
              <Button 
                 mode="contained"
                 buttonColor={primaryColor}
                 onPress={() => openInGmaps(selectedStation.latitude, selectedStation.longitude, selectedStation.name)}
              >
                ITINÉRAIRE
              </Button>
            </Card.Actions>
          </Card>
        )}
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  webPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  webTitle: { fontSize: 20, fontWeight: '800', marginTop: 20, textAlign: 'center' },
  webSub: { fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  markerContainer: { padding: 8, borderRadius: 15, borderWidth: 2, borderColor: 'white' },
  searchOverlay: { position: 'absolute', top: 15, left: 15, right: 15, zIndex: 10 },
  searchbar: { borderRadius: 14, elevation: 4, borderWidth: 1 },
  floatingCard: { position: 'absolute', bottom: 100, left: 15, right: 15, borderRadius: 20, elevation: 8 }
});