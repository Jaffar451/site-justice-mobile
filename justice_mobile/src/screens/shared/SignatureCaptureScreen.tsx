// PATH: src/screens/shared/SignatureCaptureScreen.tsx
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme/AppThemeProvider';

interface Props {
  navigation: any;
  route: {
    params: {
      onSave: (signatureBase64: string) => void;
      title?: string;
    };
  };
}

export default function SignatureCaptureScreen({ navigation, route }: Props) {
  const { theme, isDark } = useAppTheme();
  const ref = useRef<SignatureViewRef>(null);
  const { onSave, title = "Signature du déclarant" } = route.params;

  const handleOK = (signature: string) => {
    // La signature arrive en format "data:image/png;base64,..."
    onSave(signature);
    navigation.goBack();
  };

  const handleEmpty = () => {
    Alert.alert("Signature manquante", "Veuillez apposer votre signature avant de valider.");
  };

  const handleClear = () => {
    ref.current?.clearSignature();
  };

  const handleConfirm = () => {
    ref.current?.readSignature();
  };

  // Styles CSS pour l'intérieur du WebView (le canvas)
  const style = `.m-signature-pad--footer { display: none; margin: 0px; }
                 body,html { height: 100%; background-color: #f8fafc; }`;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.instructions}>
        Utilisez votre doigt ou un stylet pour signer à l'intérieur du cadre ci-dessous.
      </Text>

      {/* CANVAS */}
      <View style={styles.signatureWrapper}>
        <SignatureScreen
          ref={ref}
          onOK={handleOK}
          onEmpty={handleEmpty}
          descriptionText={title}
          clearText="Effacer"
          confirmText="Valider"
          webStyle={style}
          autoClear={false}
          imageType="image/png"
        />
      </View>

      {/* ACTIONS */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.clearBtn]} 
          onPress={handleClear}
        >
          <Ionicons name="refresh-outline" size={20} color="#64748b" />
          <Text style={styles.clearBtnText}>Recommencer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.saveBtn, { backgroundColor: theme.colors.primary }]} 
          onPress={handleConfirm}
        >
          <Ionicons name="checkmark-done-circle" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Confirmer la signature</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 50, 
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  closeBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase' },
  instructions: { 
    textAlign: 'center', 
    fontSize: 13, 
    color: '#64748b', 
    paddingHorizontal: 40,
    marginBottom: 20,
    lineHeight: 18
  },
  signatureWrapper: { 
    flex: 1, 
    marginHorizontal: 20, 
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff'
  },
  footer: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    paddingBottom: 40, 
    gap: 12 
  },
  button: { 
    flex: 1, 
    height: 55, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8 
  },
  clearBtn: { backgroundColor: '#f1f5f9' },
  clearBtnText: { color: '#64748b', fontWeight: '800', fontSize: 14 },
  saveBtn: { elevation: 3 },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});