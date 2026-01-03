import React from 'react';
import { View, Text } from 'react-native';

const MapView = ({ children, style }: any) => (
  <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0' }]}>
    <Text>Carte non disponible sur Web (Utilisez Leaflet ou Google Maps JS API)</Text>
  </View>
);

export const Marker = () => null;
export default MapView;