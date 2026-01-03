import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
// ✅ Utilisation de Zustand (useAuthStore) au lieu de useAuth (Context)
import { useAuthStore } from '../stores/useAuthStore'; 
import { API_URL } from '../config/constants';

export const useSosListener = (navigation: any) => {
  // ✅ Récupération sécurisée depuis le store Zustand
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  
  const socketRef = useRef<Socket | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  /**
   * 🚨 DÉCLENCHEUR D'EFFETS D'URGENCE
   */
  const triggerEmergencyEffects = async () => {
    try {
      // 1. 📳 Vibration (Uniquement sur Mobile)
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // 2. 🔊 Son (Sirène)
      // Note: Sur Web, les navigateurs bloquent souvent l'audio auto-play
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/police_siren.mp3')
      );
      soundRef.current = sound;
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
    } catch (error) {
      console.warn("SOS Effects Error:", error);
    }
  };

  /**
   * 🛑 ARRÊT DES EFFETS
   */
  const stopEmergencyEffects = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (e) {
      console.warn("Stop Effects Error:", e);
    }
  };

  useEffect(() => {
    // ✅ Vérification stricte de l'existence de l'utilisateur et de son rôle
    if (user && user.role === 'police' && user.policeStationId && token) {
      
      socketRef.current = io(API_URL, {
        auth: { token },
        transports: ['websocket'], // Recommandé pour la stabilité
      });

      socketRef.current.on("connect", () => {
        console.log("📡 Liaison SOS active - Commissariat:", user.policeStationId);
        socketRef.current?.emit("join_station", user.policeStationId);
      });

      socketRef.current.on("new_sos_alert", (data) => {
        triggerEmergencyEffects();

        // Sur Web, on utilise souvent l'API Notification ou un confirm
        Alert.alert(
          "🚨 URGENCE SOS",
          `Citoyen: ${data.senderName}\nDistance: ${data.distance} km`,
          [
            { 
              text: "INTERVENIR", 
              onPress: () => {
                stopEmergencyEffects();
                if (navigation?.isReady?.()) {
                  navigation.navigate('SosDetail', { alert: data });
                }
              }
            },
            { 
              text: "IGNORER", 
              style: "cancel",
              onPress: () => stopEmergencyEffects()
            }
          ],
          { cancelable: false }
        );
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Socket Connect Error:", err.message);
      });
    }

    return () => {
      socketRef.current?.disconnect();
      stopEmergencyEffects();
    };
    // ✅ Ajout de user et token dans les dépendances
  }, [user, token, navigation]);
};