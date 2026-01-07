import React, { useState } from 'react';
import { StyleSheet, View, Linking, Platform, StatusBar, Dimensions, Alert } from 'react-native';
import { Text, Button, Avatar, IconButton, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// ✅ Architecture
import { useAppTheme } from '../../theme/AppThemeProvider';
import { PoliceScreenProps } from '../../types/navigation';
import ScreenContainer from '../../components/layout/ScreenContainer';
import SmartFooter from '../../components/layout/SmartFooter';

// Import conditionnel Maps (Évite les crashs Web/Simulateurs sans API Google)
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
    console.warn("Service Maps non chargé.");
  }
}

export default function SosDetailScreen({ route, navigation }: PoliceScreenProps<'SosDetail'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const [isResolving, setIsResolving] = useState(false);
  
  // 🛡️ Récupération sécurisée des paramètres
  const alertData = route.params?.alert;

  if (!alertData) {
    return (
      <View style={styles.errorContainer}>
        <Text>Données de l'alerte introuvables.</Text>
        <Button onPress={() => navigation.goBack()}>Retour</Button>
      </View>
    );
  }

  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
  };

  const openItinerary = () => {
    const latLng = `${alertData.latitude},${alertData.longitude}`;
    const url = Platform.select({
      ios: `maps:0,0?q=SOS@${latLng}`,
      android: `geo:0,0?q=${latLng}(SOS)`,
      default: `https://www.google.com/maps/search/?api=1&query=${latLng}`
    });
    if (url) Linking.openURL(url);
  };

  const handleCall = () => {
    if (alertData.senderPhone) Linking.openURL(`tel:${alertData.senderPhone}`);
  };

  const handleResolve = () => {
    Alert.alert(
      "Clôturer l'Intervention",
      "Confirmez-vous la fin de l'alerte ? L'heure sera archivée.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: () => {
            setIsResolving(true);
            setTimeout(() => {
              setIsResolving(false);
              navigation.goBack();
            }, 1000);
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <View style={styles.container}>
        {/* 🗺️ CARTE GPS */}
        {Platform.OS !== 'web' ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: alertData.latitude,
              longitude: alertData.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker coordinate={{ latitude: alertData.latitude, longitude: alertData.longitude }}>
              <View style={styles.markerWrapper}>
                <View style={styles.markerPulse} />
                <Ionicons name="location" size={44} color="#EF4444" />
              </View>
            </Marker>
          </MapView>
        ) : (
          <View style={[styles.webPlaceholder, { backgroundColor: colors.bgMain }]}>
            <Avatar.Icon size={80} icon="map-marker-alert" style={{ backgroundColor: '#FEE2E2' }} color="#EF4444" />
            <Text style={[styles.webText, { color: colors.textMain }]}>Mode Web : Carte indisponible</Text>
            <Text style={{ color: colors.textSub }}>GPS : {alertData.latitude}, {alertData.longitude}</Text>
          </View>
        )}

        {/* ⬅️ RETOUR */}
        <IconButton
          icon="chevron-left"
          mode="contained"
          containerColor={colors.bgCard}
          iconColor={colors.textMain}
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        />

        {/* 🚨 PANNEAU D'ACTION */}
        <Surface style={[styles.detailsSheet, { backgroundColor: colors.bgCard }]} elevation={4}>
          <View style={[styles.dragIndicator, { backgroundColor: colors.border }]} />
          
          <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text variant="headlineSmall" style={[styles.bold, { color: colors.textMain }]}>
                  {alertData.senderName || "Inconnu"}
                </Text>
                <View style={styles.badgeRow}>
                  <Ionicons name="navigate" size={14} color="#EF4444" />
                  <Text style={styles.distanceText}>À {alertData.distance || '0.5'} km de vous</Text>
                </View>
              </View>
              <Avatar.Image 
                size={55} 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1022/1022319.png' }} 
                style={{ backgroundColor: '#FEE2E2' }}
              />
          </View>

          <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text variant="labelSmall" style={{ color: colors.textSub }}>NUMÉRO DE CONTACT</Text>
                <Text variant="bodyLarge" style={[styles.bold, { color: colors.textMain }]}>{alertData.senderPhone || "N/A"}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text variant="labelSmall" style={{ color: colors.textSub }}>PRIORITÉ</Text>
                <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>MAXIMALE</Text>
                </View>
              </View>
          </View>

          <View style={styles.actionRow}>
            <Button 
              mode="outlined" 
              icon="phone" 
              onPress={handleCall} 
              style={[styles.btn, { borderColor: primaryColor }]} 
              textColor={primaryColor}
            > Appeler </Button>
            
            <Button 
              mode="contained" 
              icon="map" 
              onPress={openItinerary} 
              style={[styles.btn, { backgroundColor: '#EF4444' }]}
            > Itinéraire </Button>
          </View>

          <Button 
            mode="contained-tonal" 
            onPress={handleResolve} 
            loading={isResolving}
            style={styles.resolveBtn}
            contentStyle={{ height: 50 }}
          > Terminer l'intervention </Button>
        </Surface>

        <SmartFooter />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  markerWrapper: { alignItems: 'center', justifyContent: 'center' },
  markerPulse: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1, borderColor: '#EF4444' },
  webPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  webText: { marginTop: 10, fontWeight: '900', fontSize: 18 },
  backBtn: { position: 'absolute', top: 45, left: 15, zIndex: 10 },
  detailsSheet: { 
    position: 'absolute', bottom: 100, left: 10, right: 10, 
    borderRadius: 30, padding: 20, paddingBottom: 25 
  },
  dragIndicator: { width: 40, height: 5, borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  distanceText: { color: '#EF4444', fontWeight: '800', marginLeft: 4, fontSize: 12 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  infoItem: { flex: 1 },
  bold: { fontWeight: '900' },
  urgentBadge: { backgroundColor: '#FCA5A5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  urgentText: { color: '#7F1D1D', fontWeight: '900', fontSize: 10 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  btn: { flex: 1, borderRadius: 12 },
  resolveBtn: { borderRadius: 12, marginTop: 5 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});