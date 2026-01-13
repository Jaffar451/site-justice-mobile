import React, { useState, useCallback, useEffect } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; 
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Imports Architecture
import { useAuthStore } from '../../stores/useAuthStore';
import { getAppTheme } from '../../theme';
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';

const { width } = Dimensions.get('window');

export default function VerificationScannerScreen() {
  const theme = getAppTheme();
  const primaryColor = theme.color;
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isMounted, setIsMounted] = useState(false); // ✅ Fix pour le Web

  // 🛡️ Évite les erreurs d'hydratation/workers sur Web
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🛡️ Réinitialisation du scanner lors du focus
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, [])
  );

  /**
   * 🔍 LOGIQUE DE VALIDATION
   * Analyse la structure du QR Code pour extraire l'ID.
   * 

[Image of QR code structure]

   */
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      console.log("📸 Scan Data:", data); // Debug

      // ✅ 1. Extraction Robuste avec Regex
      // Supporte : "http://.../123", "RG-123", "123"
      const match = data.match(/(\d+)\/?$/);
      
      if (match && match[1]) {
        const complaintId = parseInt(match[1], 10);

        if (!isNaN(complaintId)) {
          // ✅ Feedback Web & Mobile
          const message = `Document certifié par le Ministère de la Justice.\nDossier N° : RG-${complaintId}`;
          
          if (Platform.OS === 'web') {
             // Sur Web, on utilise window.confirm pour simuler les boutons
             const choice = window.confirm(`${message}\n\nCliquez sur OK pour consulter le registre.`);
             if (choice) navigateToDetails(complaintId);
             else setScanned(false);
          } else {
             Alert.alert(
                "Document Authentifié ✅",
                message,
                [
                  { text: "Fermer", onPress: () => setScanned(false), style: "cancel" },
                  { text: "Consulter le Registre", onPress: () => navigateToDetails(complaintId) }
                ]
             );
          }
        } else {
          throw new Error("ID Invalide");
        }
      } else {
        throw new Error("Format Invalide");
      }
    } catch (error) {
      const msg = "Ce code ne provient pas d'une source certifiée (DIM/MJ).";
      if (Platform.OS === 'web') {
          window.alert(`⚠️ Alerte Sécurité: ${msg}`);
          setScanned(false);
      } else {
          Alert.alert("Alerte Sécurité ⚠️", msg, [{ text: "Réessayer", onPress: () => setScanned(false) }]);
      }
    }
  };

  const navigateToDetails = (id: number) => {
      const policeRoles = ['officier_police', 'inspecteur', 'commissaire', 'opj_gendarme', 'gendarme'];
      const isLawEnforcement = user?.role && policeRoles.includes(user.role as string);
      const targetScreen = isLawEnforcement ? "PoliceComplaintDetails" : "ComplaintDetail";
      
      navigation.navigate(targetScreen, { id: id, complaintId: id });
  };

  // ✅ Chargement initial (Pour éviter le crash Web Worker)
  if (!isMounted) {
      return <View style={styles.centerLoader}><ActivityIndicator color={primaryColor} /></View>;
  }

  // ✅ Gestion Permission
  if (!permission) {
    return <View style={styles.centerLoader}><ActivityIndicator size="large" color={primaryColor} /></View>;
  }

  if (!permission.granted) {
    return (
      <ScreenContainer withPadding={false}>
        <AppHeader title="Permission Requise" showBack />
        <View style={styles.centerPermission}>
          <View style={[styles.iconCircle, { backgroundColor: primaryColor + "15" }]}>
            <Ionicons name="camera-outline" size={60} color={primaryColor} />
          </View>
          <Text style={styles.permissionTitle}>Accès Caméra Requis</Text>
          <Text style={styles.permissionText}>
            L'autorisation est nécessaire pour scanner et authentifier les actes judiciaires.
          </Text>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: primaryColor }]} 
            onPress={requestPermission}
          >
            <Text style={styles.actionBtnText}>ACTIVER LA CAMÉRA</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Scanner QR" showBack />
      
      <View style={styles.container}>
        {/* ✅ CameraView optimisée pour éviter les crashs de layout */}
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        
        {/* 🏛️ Overlay Institutionnel */}
        <View style={styles.overlay}>
          <View style={styles.dimmer} />
          <View style={styles.middleRow}>
            <View style={styles.dimmer} />
            <View style={[styles.scanFrame, { borderColor: primaryColor }]}>
                {/* Coins du scanner */}
                <View style={[styles.corner, styles.topLeft, { borderColor: primaryColor }]} />
                <View style={[styles.corner, styles.topRight, { borderColor: primaryColor }]} />
                <View style={[styles.corner, styles.bottomLeft, { borderColor: primaryColor }]} />
                <View style={[styles.corner, styles.bottomRight, { borderColor: primaryColor }]} />
                
                {/* Ligne de scan animée (Suggestion visuelle) */}
                {loadingScanner && <ActivityIndicator color="#FFF" style={{marginTop: 100}} />}
            </View>
            <View style={styles.dimmer} />
          </View>
          <View style={[styles.dimmer, styles.bottomDimmer]}>
            <Text style={styles.instruction}>Scannez le Code QR</Text>
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

// Variable temporaire pour l'UI
const loadingScanner = false;

const styles = StyleSheet.create({
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  centerPermission: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  iconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  container: { flex: 1, backgroundColor: '#000', overflow: 'hidden' }, // overflow hidden important pour le Web
  permissionTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginBottom: 10, textAlign: 'center' },
  permissionText: { textAlign: 'center', lineHeight: 22, color: '#64748B', marginBottom: 35, paddingHorizontal: 10, fontWeight: '500' },
  actionBtn: { paddingHorizontal: 35, paddingVertical: 18, borderRadius: 16, elevation: 4 },
  actionBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  
  overlay: { flex: 1, ...StyleSheet.absoluteFillObject }, // Overlay couvre bien la caméra
  dimmer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  middleRow: { flexDirection: 'row', height: 260 },
  scanFrame: { width: 260, height: 260, position: 'relative', backgroundColor: 'transparent' },
  bottomDimmer: { flex: 1.5, alignItems: 'center', paddingTop: 35 },
  instruction: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: -0.2 },
  subInstruction: { color: 'rgba(255,255,255,0.7)', marginTop: 12, fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5 },
  
  corner: { position: 'absolute', width: 35, height: 35, borderWidth: 5 },
  topLeft: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0 },
  
  retryBtn: { position: 'absolute', bottom: 50, alignSelf: 'center', paddingHorizontal: 25, paddingVertical: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', elevation: 8, zIndex: 10 },
  retryBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 }
});