import React, { useState } from 'react';
import { StyleSheet, View, Linking, Platform, StatusBar, Dimensions, Alert } from 'react-native';
import { Text, Button, Avatar, IconButton, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// ✅ 1. Imports Architecture
import { useAppTheme } from '../../theme/AppThemeProvider'; // ✅ Changé pour le hook dynamique
import { PoliceScreenProps } from '../../types/navigation';
import ScreenContainer from '../../components/layout/ScreenContainer';
import SmartFooter from '../../components/layout/SmartFooter';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Import conditionnel sécurisé pour Maps
let MapView: any = View;
let Marker: any = View;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.warn("Service Maps indisponible.");
  }
}

export default function SosDetailScreen({ route, navigation }: PoliceScreenProps<'SosDetail'>) {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const [isResolving, setIsResolving] = useState(false);
  
  // Récupération sécurisée des paramètres
  const { alert } = route.params;

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    surface: isDark ? "#1E293B" : "#FFFFFF",
  };

  const openItinerary = () => {
    const latLng = `${alert.latitude},${alert.longitude}`;
    const label = encodeURIComponent(`SOS: ${alert.senderName}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latLng}`,
      android: `geo:0,0?q=${latLng}(${label})`,
      default: `http://maps.google.com/?q=${latLng}`
    });
    if (url) Linking.openURL(url);
  };

  const handleCall = () => {
    if (alert.senderPhone) Linking.openURL(`tel:${alert.senderPhone}`);
  };

  const handleResolve = async () => {
    Alert.alert(
      "Clôturer l'Alerte",
      "Voulez-vous marquer cette intervention comme terminée ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: async () => {
            setIsResolving(true);
            setTimeout(() => {
              setIsResolving(false);
              if (Platform.OS === 'web') window.alert("Intervention clôturée.");
              else Alert.alert("Succès", "L'intervention a été archivée.");
              navigation.goBack();
            }, 1200);
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <View style={[styles.container, { backgroundColor: colors.bgMain }]}>
        
        {/* 🗺️ ZONE CARTE */}
        {Platform.OS !== 'web' ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            customMapStyle={isDark ? darkMapStyle : []} // Style sombre pour la carte
            initialRegion={{
              latitude: alert.latitude,
              longitude: alert.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker coordinate={{ latitude: alert.latitude, longitude: alert.longitude }}>
              <View style={styles.markerContainer}>
                <View style={[styles.markerPulse, { borderColor: '#EF4444' }]} />
                <Ionicons name="location" size={40} color="#EF4444" />
              </View>
            </Marker>
          </MapView>
        ) : (
          <View style={[styles.webPlaceholder, { backgroundColor: colors.bgMain }]}>
            <Avatar.Icon size={80} icon="map-marker-radius" style={{ backgroundColor: isDark ? "#450A0A" : '#FEE2E2' }} color="#EF4444" />
            <Text variant="headlineSmall" style={[styles.webText, { color: colors.textMain }]}>Localisation GPS</Text>
            <Text style={[styles.coordsText, { color: colors.textSub }]}>Lat: {alert.latitude} / Lng: {alert.longitude}</Text>
          </View>
        )}

        {/* ⬅️ BOUTON RETOUR */}
        <IconButton
          icon="arrow-left"
          mode="contained"
          containerColor={colors.bgCard}
          iconColor={colors.textMain}
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        />

        {/* 🚨 PANNEAU D'INTERVENTION */}
        <Surface style={[styles.detailsContainer, { backgroundColor: colors.bgCard }]} elevation={5}>
          <View style={[styles.dragIndicator, { backgroundColor: colors.border }]} />
          
          <View style={styles.headerRow}>
             <View style={styles.headerTextContainer}>
                <Text variant="titleLarge" style={[styles.cardTitle, { color: colors.textMain }]}>
                    {alert.senderName || "Signalement Urgent"}
                </Text>
                <View style={styles.distanceBadge}>
                  <Ionicons name="navigate-circle" size={16} color="#EF4444" />
                  <Text variant="bodySmall" style={styles.distanceText}>
                      À {alert.distance || '?'} km de votre position
                  </Text>
                </View>
             </View>
             <Avatar.Icon size={50} icon="account-alert" style={{ backgroundColor: '#EF4444' }} color="white" />
          </View>

          <View style={styles.infoGrid}>
             <View style={styles.infoBlock}>
                <Text variant="labelSmall" style={[styles.infoLabel, { color: colors.textSub }]}>CONTACT</Text>
                <Text variant="titleMedium" style={[styles.phoneValue, { color: colors.textMain }]}>{alert.senderPhone}</Text>
             </View>
             <View style={styles.infoBlock}>
                <Text variant="labelSmall" style={[styles.infoLabel, { color: colors.textSub }]}>PRIORITÉ</Text>
                <View style={[styles.priorityBadge, { backgroundColor: isDark ? "#450A0A" : "#FEE2E2" }]}>
                    <Text style={[styles.priorityText, { color: isDark ? "#FCA5A5" : "#B91C1C" }]}>URGENCE VITALE</Text>
                </View>
             </View>
          </View>

          <View style={styles.actions}>
            <Button 
              mode="outlined" 
              icon="phone" 
              onPress={handleCall} 
              style={[styles.flexBtn, { borderColor: primaryColor }]} 
              textColor={primaryColor} 
              contentStyle={{ height: 50 }}
            >
              Appeler
            </Button>
            <Button 
              mode="contained" 
              icon="navigation" 
              onPress={openItinerary} 
              style={styles.flexBtn} 
              buttonColor="#EF4444" 
              contentStyle={{ height: 50 }}
            >
              Itinéraire
            </Button>
          </View>

          <Button 
            mode="contained-tonal" 
            style={[styles.finishBtn, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]} 
            onPress={handleResolve} 
            loading={isResolving} 
            disabled={isResolving}
            textColor={isDark ? "#BAE6FD" : primaryColor}
            contentStyle={{ height: 50 }}
          >
            Clôturer l'intervention
          </Button>
        </Surface>

        <SmartFooter />
      </View>
    </ScreenContainer>
  );
}

// Style pour la carte en mode sombre
const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  markerContainer: { alignItems: 'center', justifyContent: 'center' },
  markerPulse: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 2 },
  webPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  webText: { marginTop: 15, fontWeight: '900' },
  coordsText: { marginTop: 5 },
  
  backBtn: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 50 : 25, 
    left: 20, 
    zIndex: 10,
    elevation: 4
  },
  
  detailsContainer: { 
    position: 'absolute', 
    left: 10, 
    right: 10, 
    bottom: 95, 
    borderRadius: 32, 
    paddingHorizontal: 20, 
    paddingBottom: 25,
    ...Platform.select({
      web: { boxShadow: '0px -4px 20px rgba(0,0,0,0.15)' }
    })
  },
  
  dragIndicator: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginVertical: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTextContainer: { flex: 1 },
  cardTitle: { fontWeight: '900', letterSpacing: -0.5 },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  distanceText: { color: '#EF4444', fontWeight: '800', marginLeft: 5 },
  
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  infoBlock: { flex: 1 },
  infoLabel: { fontWeight: '800', marginBottom: 4, letterSpacing: 1 },
  phoneValue: { fontWeight: '800' },
  priorityBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  priorityText: { fontWeight: '900', fontSize: 10 },
  
  actions: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  flexBtn: { flex: 1, borderRadius: 16 },
  finishBtn: { borderRadius: 16 },
});