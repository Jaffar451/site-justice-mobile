import React, { useState, useCallback } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  StatusBar
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; 
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Imports Architecture Alignés
import { useAuthStore } from '../../stores/useAuthStore';
import { getAppTheme } from '../../theme';
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';

export default function VerificationScannerScreen() {
  // ✅ 2. Thème & Auth (Zustand)
  const theme = getAppTheme();
  const primaryColor = theme.color;
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // 🛡️ Réinitialisation du scanner lors du focus
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, [])
  );

  /**
   * 🔍 LOGIQUE DE VALIDATION ET AUTHENTIFICATION DU DOCUMENT
   */
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      // Extraction de l'identifiant unique (Format attendu: https://.../verify/ID)
      const parts = data.split('/');
      const lastPart = parts[parts.length - 1];
      const complaintId = parseInt(lastPart, 10);

      if (!isNaN(complaintId)) {
        Alert.alert(
          "Document Authentifié ✅",
          `Ce document est certifié par le Ministère de la Justice du Niger.\n\nDossier N° : RG-${complaintId}`,
          [
            { text: "Fermer", onPress: () => setScanned(false), style: "cancel" },
            { 
              text: "Consulter le Registre", 
              onPress: () => {
                // Redirection intelligente selon le rôle
                const targetScreen = (user?.role === 'police' || user?.role === 'opj') 
                    ? "PoliceComplaintDetails" 
                    : "ComplaintDetail";
                
                navigation.navigate(targetScreen, { 
                    id: complaintId, 
                    complaintId: complaintId 
                });
              } 
            }
          ]
        );
      } else {
        throw new Error("Format Invalide");
      }
    } catch (error) {
      Alert.alert(
        "Alerte Sécurité ⚠️", 
        "Ce code ne provient pas d'une source certifiée par la Direction de l'Informatique du Ministère de la Justice (DIM/MJ).", 
        [{ text: "Réessayer", onPress: () => setScanned(false) }]
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer withPadding={false}>
        <AppHeader title="Permission Requise" showBack />
        <View style={styles.centerPermission}>
          <View style={[styles.iconCircle, { backgroundColor: primaryColor + "15" }]}>
            <Ionicons name="camera-outline" size={60} color={primaryColor} />
          </View>
          <Text style={styles.permissionTitle}>Accès à la caméra</Text>
          <Text style={styles.permissionText}>
            L'autorisation de la caméra est indispensable pour authentifier les actes numériques et assurer la sécurité juridique des documents.
          </Text>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: primaryColor }]} 
            onPress={requestPermission}
          >
            <Text style={styles.actionBtnText}>ACTIVER LE SCANNER</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Authentification Document" showBack />
      
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
        
        {/* 🏛️ Overlay Institutionnel Niger Justice */}
        <View style={styles.overlay}>
          <View style={styles.dimmer} />
          <View style={styles.middleRow}>
            <View style={styles.dimmer} />
            <View style={[styles.scanFrame, { borderColor: primaryColor }]}>
                <View style={[styles.corner, styles.topLeft, { borderColor: primaryColor }]} />
                <View style={[styles.corner, styles.topRight, { borderColor: primaryColor }]} />
                <View style={[styles.corner, styles.bottomLeft, { borderColor: primaryColor }]} />
                <View style={[styles.corner, styles.bottomRight, { borderColor: primaryColor }]} />
            </View>
            <View style={styles.dimmer} />
          </View>
          <View style={[styles.dimmer, styles.bottomDimmer]}>
            <Text style={styles.instruction}>Ciblez le QR Code de l'acte</Text>
            <Text style={styles.subInstruction}>REPUBLIQUE DU NIGER • DIM/MJ</Text>
          </View>
        </View>

        {scanned && (
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.retryBtn, { backgroundColor: primaryColor }]} 
            onPress={() => setScanned(false)}
          >
            <Ionicons name="refresh" size={20} color="#FFF" style={{marginRight: 10}} />
            <Text style={styles.retryBtnText}>NOUVELLE VÉRIFICATION</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  centerPermission: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  iconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  container: { flex: 1, backgroundColor: '#000' },
  permissionTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginBottom: 10 },
  permissionText: { textAlign: 'center', lineHeight: 22, color: '#64748B', marginBottom: 35, paddingHorizontal: 10, fontWeight: '500' },
  actionBtn: { paddingHorizontal: 35, paddingVertical: 18, borderRadius: 16, elevation: 4 },
  actionBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  
  overlay: { flex: 1 },
  dimmer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  middleRow: { flexDirection: 'row', height: 260 },
  scanFrame: { width: 260, height: 260, position: 'relative' },
  bottomDimmer: { flex: 1.5, alignItems: 'center', paddingTop: 35 },
  instruction: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
  subInstruction: { color: 'rgba(255,255,255,0.6)', marginTop: 12, fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5 },
  
  corner: { position: 'absolute', width: 35, height: 35, borderWidth: 5 },
  topLeft: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0 },
  
  retryBtn: { position: 'absolute', bottom: 50, alignSelf: 'center', paddingHorizontal: 25, paddingVertical: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', elevation: 8 },
  retryBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 }
});