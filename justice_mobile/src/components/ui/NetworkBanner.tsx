import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

export const NetworkBanner = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [heightAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      // Sur simulateur, isInternetReachable peut être null au début, on assume true si isConnected est true
      setIsConnected(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: isConnected ? 0 : 40,
      duration: 300,
      useNativeDriver: false, // height n'est pas supporté par native driver
    }).start();
  }, [isConnected]);

  if (isConnected) return null;

  return (
    <Animated.View style={[styles.container, { height: heightAnim }]}>
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={16} color="#FFF" />
        <Text style={styles.text}>Mode Hors-ligne : Les actions seront synchronisées ultérieurement.</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#475569', // Gris foncé/Bleuté (Professionnel) ou #EF4444 (Rouge alerte)
    overflow: 'hidden',
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    gap: 8,
  },
  text: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  }
});