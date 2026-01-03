// PATH: src/components/ui/EvidenceViewer.tsx
import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions, 
  Platform 
} from "react-native";
import { Video, ResizeMode } from "expo-av"; 
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../theme/AppThemeProvider";

interface EvidenceProps {
  uri: string;
  type: "image" | "video" | "pdf";
  fileName?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function EvidenceViewer({ uri, type, fileName }: EvidenceProps) {
  const { theme, isDark } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // ✅ Rendu de la miniature selon le type de preuve
  const renderThumbnail = () => {
    const placeholderBg = isDark ? "#333" : "#f0f0f0";

    if (type === "video") {
      return (
        <View style={[styles.thumbnail, styles.mediaPlaceholder, { backgroundColor: placeholderBg }]}>
          <Ionicons name="play-circle" size={40} color={theme.colors.primary} />
          <Text style={styles.mediaTypeLabel}>VIDÉO</Text>
        </View>
      );
    }
    if (type === "pdf") {
      return (
        <View style={[styles.thumbnail, styles.mediaPlaceholder, { backgroundColor: placeholderBg }]}>
          <Ionicons name="document-text" size={40} color="#FF5722" />
          <Text style={styles.mediaTypeLabel}>DOCUMENT PDF</Text>
        </View>
      );
    }
    return (
      <Image 
        source={{ uri }} 
        style={styles.thumbnail} 
        resizeMode="cover"
      />
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => setModalVisible(true)}
        style={[
          styles.wrapper, 
          { 
            backgroundColor: isDark ? "#222" : "#fff",
            borderColor: isDark ? "#444" : "#eee" 
          }
        ]}
      >
        {renderThumbnail()}
        
        {fileName && (
          <View style={styles.fileNameContainer}>
            <Text style={[styles.fileName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {fileName}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ✅ MODAL DE VISUALISATION PLEIN ÉCRAN */}
      <Modal 
        visible={modalVisible} 
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close-circle" size={45} color="#fff" />
          </TouchableOpacity>

          {type === "image" && (
            <Image 
              source={{ uri }} 
              style={styles.fullMedia} 
              resizeMode="contain" 
            />
          )}

          {type === "video" && (
            <Video
              source={{ uri }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              useNativeControls
              style={styles.fullMedia}
            />
          )}

          {type === "pdf" && (
            <View style={styles.pdfNotice}>
                <Ionicons name="cloud-download-outline" size={80} color="#fff" />
                <Text style={styles.pdfText}>
                    Ce document PDF contient des preuves judiciaires et doit être téléchargé pour consultation sécurisée.
                </Text>
                <TouchableOpacity 
                    style={[styles.downloadBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={() => {/* Logique de téléchargement ou partage */}}
                >
                    <Ionicons name="download" size={20} color="#fff" style={{marginRight: 10}} />
                    <Text style={styles.downloadBtnText}>Télécharger le fichier</Text>
                </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { margin: 8 },
  wrapper: { 
    width: 110, 
    borderRadius: 16, 
    borderWidth: 1, 
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 }
    })
  },
  thumbnail: { width: 110, height: 110 },
  mediaPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  mediaTypeLabel: { fontSize: 10, fontWeight: '900', marginTop: 5, color: '#888', letterSpacing: 1 },
  fileNameContainer: { padding: 6, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  fileName: { fontSize: 10, textAlign: 'center', fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.98)', justifyContent: 'center', alignItems: 'center' },
  closeButton: { position: 'absolute', top: 50, right: 25, zIndex: 10 },
  fullMedia: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.8 },
  pdfNotice: { alignItems: 'center', padding: 30 },
  pdfText: { color: '#fff', textAlign: 'center', marginTop: 20, marginBottom: 30, fontSize: 15, lineHeight: 22 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 12 },
  downloadBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});