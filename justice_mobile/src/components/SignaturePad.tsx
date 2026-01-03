import React, { useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';

// ✅ Interface complète pour une intégration facile dans les workflows judiciaires
interface Props {
  onOK: (signature: string) => void; // Retourne l'image en Base64 (data:image/png;base64,...)
  description: string;
  penColor?: string;
  backgroundColor?: string;
  clearText?: string;
  confirmText?: string;
}

export const SignaturePad = ({ 
  onOK, 
  description,
  penColor = '#1A237E', // Bleu nuit institutionnel par défaut
  backgroundColor = '#FFFFFF',
  clearText = 'Effacer le tracé',
  confirmText = 'Confirmer la signature'
}: Props) => {
  const ref = useRef<any>(null);

  // Appelé lorsque l'utilisateur valide la signature (via readSignature)
  const handleOK = (signature: string) => {
    onOK(signature); 
  };

  const handleEmpty = () => {
    console.log('Signature vide');
  };

  // 🎨 Style injecté dans la WebView pour un rendu professionnel
  const webStyle = `
    .m-signature-pad--footer { display: none; margin: 0; }
    body, html { 
      width: 100%; height: 100%; 
      overflow: hidden; 
      background-color: transparent;
    }
    .m-signature-pad {
      box-shadow: none;
      border: none;
    }
  `;

  return (
    <View style={styles.container}>
      {/* Label descriptif (ex: "Signature du plaignant") */}
      <Text style={[styles.label, { color: '#64748B' }]}>{description}</Text>
      
      <View style={[styles.padContainer, { borderColor: penColor + '25' }]}>
        <SignatureScreen
          ref={ref}
          onOK={handleOK}
          onEmpty={handleEmpty}
          penColor={penColor}
          backgroundColor={backgroundColor}
          descriptionText={description}
          webStyle={webStyle}
          autoClear={false}
          imageType="image/png"
          trimWhitespace={true} // Retire les espaces vides autour de la signature
        />
      </View>

      <View style={styles.row}>
        {/* Bouton Réinitialiser */}
        <TouchableOpacity 
          style={styles.btnReset} 
          onPress={() => ref.current?.clearSignature()}
          activeOpacity={0.7}
        >
          <Text style={styles.resetText}>{clearText}</Text>
        </TouchableOpacity>

        {/* Bouton Valider */}
        <TouchableOpacity 
          style={[styles.btnSave, { backgroundColor: penColor }]} 
          onPress={() => ref.current?.readSignature()}
          activeOpacity={0.85}
        >
          <Text style={styles.saveText}>{confirmText.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    width: '100%', 
    height: 380, // Hauteur fixe recommandée pour éviter les bugs de WebView
    marginVertical: 15 
  },
  label: { 
    fontSize: 12, 
    fontWeight: '800', 
    marginBottom: 10, 
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  padContainer: { 
    flex: 1, 
    borderWidth: 2, 
    borderRadius: 20, 
    overflow: 'hidden',
    borderStyle: 'dashed',
    backgroundColor: '#FFF'
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 15,
    gap: 10
  },
  btnReset: { 
    paddingVertical: 14, 
    flex: 1,
    alignItems: 'center'
  },
  resetText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 13,
  },
  btnSave: { 
    paddingVertical: 16, 
    borderRadius: 14,
    flex: 1.5,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 }
    })
  },
  saveText: { 
    color: 'white', 
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5
  }
});