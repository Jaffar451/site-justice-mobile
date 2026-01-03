import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator,
  Platform,
  StatusBar,
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "@react-navigation/native"; 

// ✅ Imports Architecture
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Import corrigé pour le thème dynamique
import { CitizenScreenProps } from "../../types/navigation";

// Services
import { getComplaintById, Complaint } from "../../services/complaint.service";
import { API_URL } from "../../services/api"; 

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

const QUEUE_KEY = '@justice_offline_queue';

export default function CitizenComplaintDetailsScreen({ navigation, route }: CitizenScreenProps<'ComplaintDetail'>) {
  // ✅ Gestion du Thème Sombre
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const id = route.params?.id;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // 🎨 PALETTE DYNAMIQUE
  const bgMain = isDark ? "#0F172A" : "#F8FAFC";
  const bgCard = isDark ? "#1E293B" : "#FFFFFF";
  const textMain = isDark ? "#FFFFFF" : "#1E293B";
  const textSub = isDark ? "#94A3B8" : "#94A3B8"; // Gris clair sur fond sombre
  const borderCol = isDark ? "#334155" : "#E2E8F0";
  const iconColor = isDark ? "#CBD5E1" : "#64748B";

  const load = async () => {
    if (!id) return;
    try {
      if (!complaint) setLoading(true);
      
      if (String(id).startsWith("TEMP-")) {
        setIsOfflineMode(true);
        const realId = String(id).replace("TEMP-", "");
        const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
        const queue = queueJson ? JSON.parse(queueJson) : [];
        const action = queue.find((item: any) => item.id === realId);
        
        if (action) {
          setComplaint({
            ...action.payload,
            id: id as any,
            status: "soumise",
            filedAt: new Date(action.timestamp).toISOString(),
            isOfflinePending: true,
            attachments: action.payload.attachments || [] 
          });
        }
      } else {
        setIsOfflineMode(false);
        const data = await getComplaintById(Number(id));
        setComplaint(data);
      }
    } catch (error) {
      console.error("Erreur chargement plainte:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [id])
  );

  const handleEdit = () => {
    if (!complaint) return;
    // @ts-ignore
    navigation.navigate('CitizenEditComplaint', { 
      complaint: complaint 
    });
  };

  const getFullFileUrl = (file: any) => {
    if (!file) return null;
    if (file.uri) return file.uri;
    if (file.path && (file.path.startsWith('http') || file.path.startsWith('file://'))) {
      return file.path;
    }
    if (file.filename) {
      const baseUrl = API_URL.replace('/api', ''); 
      return `${baseUrl}/uploads/evidence/${file.filename}`;
    }
    return null;
  };

  const isImageFile = (filename: string | undefined, mimeType: string | undefined) => {
    if (mimeType && mimeType.startsWith('image/')) return true;
    if (!filename) return false;
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
  };

  const steps = [
    { key: "soumise", label: "Dépôt", icon: "send" },
    { key: "en_cours_opj", label: "Enquête", icon: "shield" },
    { key: "transmise_parquet", label: "Parquet", icon: "briefcase" },
    { key: "saisi_juge", label: "Siège", icon: "scale" },
    { key: "jugée", label: "Décision", icon: "hammer" },
  ];

  const getActiveIndex = (status: string) => {
    if (isOfflineMode) return 0;
    const s = status?.toLowerCase() || "";
    if (["attente_validation", "en_cours_opj"].includes(s)) return 1;
    if (["transmise_parquet", "poursuite"].includes(s)) return 2;
    if (["saisi_juge", "instruction"].includes(s)) return 3;
    if (["decision", "jugée", "non_lieu", "classée_sans_suite"].includes(s)) return 4;
    return 0;
  };

  const activeIndex = complaint ? getActiveIndex(complaint.status) : 0;
  const isEditable = complaint?.status === 'soumise' && !isOfflineMode; 

  if (loading && !complaint) return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Détails" showBack />
      <View style={[styles.center, { backgroundColor: bgMain }]}><ActivityIndicator size="large" color={primaryColor} /></View>
    </ScreenContainer>
  );

  if (!complaint) return null;

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title={`Dossier #${complaint.trackingCode || (isOfflineMode ? "SYNC" : id)}`} showBack={true} />

      <View style={[styles.mainWrapper, { backgroundColor: bgMain }]}>
        <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
        >
            {isOfflineMode && (
                <View style={styles.offlineAlert}>
                    <Ionicons name="cloud-offline" size={20} color="#EA580C" />
                    <View style={{flex: 1}}>
                        <Text style={styles.offlineTitle}>En attente de connexion</Text>
                        <Text style={styles.offlineText}>Ce dossier sera transmis automatiquement.</Text>
                    </View>
                </View>
            )}

            {/* 📍 TIMELINE */}
            <View style={[styles.timelineCard, { backgroundColor: bgCard, borderColor: borderCol }]}>
                <Text style={styles.sectionTitle}>Parcours de la procédure</Text>
                <View style={styles.timeline}>
                    {steps.map((step, i) => {
                        const isDone = i <= activeIndex;
                        const isCurrent = i === activeIndex;
                        return (
                            <View key={step.key} style={styles.stepWrapper}>
                                <View style={[styles.stepCircle, { backgroundColor: isDone ? primaryColor : (isDark ? "#334155" : "#F1F5F9") }]}>
                                    <Ionicons name={step.icon as any} size={14} color={isDone ? "#fff" : iconColor} />
                                </View>
                                <Text style={[styles.stepLabel, { color: isCurrent ? primaryColor : iconColor, fontWeight: isCurrent ? "900" : "600" }]}>
                                  {step.label}
                                </Text>
                                {i < steps.length - 1 && (
                                    <View style={[styles.stepLine, { backgroundColor: i < activeIndex ? primaryColor : (isDark ? "#334155" : "#F1F5F9") }]} />
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* 📝 CONTENU */}
            <View style={[styles.card, { backgroundColor: bgCard, borderColor: borderCol }]}>
                <Text style={[styles.title, { color: textMain }]}>{complaint.title || complaint.provisionalOffence || "Plainte déposée"}</Text>
                <Text style={[styles.date, { color: textSub }]}>Enregistré le {new Date(complaint.filedAt || Date.now()).toLocaleDateString("fr-FR")}</Text>
                
                <View style={[styles.divider, { backgroundColor: borderCol }]} />
                
                <Text style={[styles.description, { color: textMain }]}>{complaint.description}</Text>
            </View>

            {/* 📎 PIÈCES JOINTES */}
            <View style={styles.attachmentsSection}>
                <Text style={styles.sectionTitle}>Documents & Preuves</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentsList}>
                    {complaint.attachments && complaint.attachments.length > 0 ? (
                      complaint.attachments.map((file: any, index: number) => {
                        const fileUrl = getFullFileUrl(file);
                        const isImg = isImageFile(file.filename, file.mimeType);

                        return (
                          <TouchableOpacity 
                            key={index} 
                            activeOpacity={0.8} 
                            style={styles.attachmentWrapper} 
                            onPress={() => fileUrl && Linking.openURL(fileUrl)}
                          >
                              <View style={[styles.attachmentThumb, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: borderCol }]}>
                                  {isImg && fileUrl ? (
                                    <Image source={{ uri: fileUrl }} style={styles.fullImg} resizeMode="cover" />
                                  ) : (
                                    <View style={styles.docIcon}>
                                      <Ionicons name="document-text" size={28} color={primaryColor} />
                                      <Text style={styles.extText}>{file.filename?.split('.').pop()?.toUpperCase() || 'DOC'}</Text>
                                    </View>
                                  )}
                              </View>
                              <Text style={[styles.attachName, { color: textSub }]} numberOfLines={1}>
                                {file.filename || `Preuve #${index + 1}`}
                              </Text>
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <View style={styles.emptyState}>
                        <Ionicons name="images-outline" size={24} color={textSub} />
                        <Text style={[styles.emptyText, { color: textSub }]}>Aucun document joint.</Text>
                      </View>
                    )}
                </ScrollView>
            </View>

            {/* ✅ BOUTON D'ACTION */}
            <View style={styles.footerSpacing}>
                {!isEditable ? (
                    <View style={[styles.lockBox, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
                        <Ionicons name="lock-closed" size={20} color={primaryColor} />
                        <Text style={[styles.lockText, { color: textSub }]}>
                          Ce dossier est en cours de traitement par les autorités. Les modifications ne sont plus possibles.
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity 
                      style={[styles.editBtn, { backgroundColor: primaryColor }]} 
                      onPress={handleEdit} 
                    >
                        <Ionicons name="create" size={20} color="#fff" />
                        <Text style={styles.editBtnText}>COMPLÉTER / AJOUTER PREUVE</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainWrapper: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  offlineAlert: { flexDirection: 'row', padding: 16, borderRadius: 16, marginBottom: 20, alignItems: 'center', gap: 12, borderWidth: 1, backgroundColor: "#FFEDD5", borderColor: "#C2410C" },
  offlineTitle: { fontWeight: '900', fontSize: 13, textTransform: 'uppercase', color: "#C2410C" },
  offlineText: { fontSize: 12, marginTop: 2, fontWeight: '500', color: "#9A3412" },
  timelineCard: { padding: 20, borderRadius: 24, marginBottom: 20, borderWidth: 1 },
  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6, color: "#64748B" },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5 },
  stepWrapper: { alignItems: 'center', flex: 1, position: 'relative' },
  stepCircle: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  stepLabel: { fontSize: 9, marginTop: 8, textAlign: 'center' },
  stepLine: { position: 'absolute', top: 17, left: '50%', width: '100%', height: 2, zIndex: 1 },
  card: { padding: 22, borderRadius: 24, marginBottom: 20, borderWidth: 1 },
  title: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  date: { fontSize: 12, marginTop: 6, fontWeight: '600' },
  divider: { height: 1, marginVertical: 18 },
  description: { fontSize: 15, lineHeight: 24, fontWeight: '500' },
  attachmentsSection: { marginBottom: 10 },
  attachmentsList: { flexDirection: 'row', paddingVertical: 5 },
  attachmentWrapper: { marginRight: 15, alignItems: 'center', width: 85 },
  attachmentThumb: { width: 80, height: 80, borderRadius: 16, borderWidth: 1, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  fullImg: { width: '100%', height: '100%' },
  docIcon: { alignItems: 'center', justifyContent: 'center' },
  extText: { fontSize: 9, fontWeight: '800', color: "#64748B", marginTop: 2 },
  attachName: { fontSize: 10, marginTop: 6, fontWeight: '600', textAlign: 'center' },
  emptyState: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 },
  emptyText: { fontStyle: 'italic', fontSize: 13 },
  footerSpacing: { marginTop: 20, paddingBottom: 130 },
  lockBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, borderRadius: 20 },
  lockText: { fontSize: 12, flex: 1, fontWeight: '600', lineHeight: 18 },
  editBtn: { flexDirection: 'row', height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 12, ...Platform.select({ android: { elevation: 3 }, ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 } }) },
  editBtnText: { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 1 }
});