import React from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Platform, 
  StatusBar 
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. Architecture & Thème
import { useAppTheme } from "../../theme/AppThemeProvider"; // Hook dynamique
import { useAuthStore } from "../../stores/useAuthStore";
import { PoliceScreenProps } from "../../types/navigation";

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

// Services
import { getComplaintById, validateToParquet, updateComplaint } from "../../services/complaint.service";

export default function CommissaireReviewScreen({ navigation, route }: PoliceScreenProps<'CommissaireReview'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const queryClient = useQueryClient();
  const params = route.params as any;
  const complaintId = params?.id || params?.complaintId;

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    pvBg: isDark ? "#111827" : "#F0F7FF",
  };

  // 📥 Récupération des données
  const { data: complaint, isLoading, isError } = useQuery({
    queryKey: ["complaint", complaintId],
    queryFn: () => getComplaintById(complaintId),
    enabled: !!complaintId,
    retry: 1, // On ne réessaie qu'une fois si échec
  });

  // ✍️ Mutation : Accorder le Visa
  const signMutation = useMutation({
    mutationFn: () => validateToParquet(complaintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-complaints"] });
      if (Platform.OS === 'web') window.alert("Visa Apposé : Dossier transmis au Procureur.");
      navigation.goBack();
    }
  });

  // ↩️ Mutation : Renvoyer à l'OPJ
  const rejectMutation = useMutation({
    mutationFn: () => updateComplaint(complaintId, { status: "en_cours_OPJ" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-complaints"] });
      if (Platform.OS === 'web') window.alert("Dossier Renvoyé pour complément.");
      navigation.goBack();
    }
  });

  const handleSign = () => {
    const title = "Apposer le Visa Hiérarchique";
    const msg = "Voulez-vous certifier la régularité de cette enquête et ordonner sa transmission au Parquet ?";

    if (Platform.OS === 'web') {
        if (window.confirm(`${title} : ${msg}`)) signMutation.mutate();
    } else {
        Alert.alert(title, msg, [
          { text: "Réviser", style: "cancel" },
          { text: "Signer & Transmettre", onPress: () => signMutation.mutate() }
        ]);
    }
  };

  // 🔄 CHARGEMENT
  if (isLoading) {
    return (
      <ScreenContainer withPadding={false}>
        <AppHeader title="Examen de procédure" showBack />
        <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loaderText, { color: colors.textSub }]}>Récupération des pièces...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // ❌ ERREUR (404 ou Réseau)
  if (isError || !complaint) {
    return (
        <ScreenContainer withPadding={false}>
          <AppHeader title="Erreur" showBack />
          <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
            <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
            <Text style={{ marginTop: 10, color: colors.textMain, fontWeight: 'bold' }}>Dossier introuvable</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
                <Text style={{color: primaryColor, fontWeight:'bold'}}>Retour au bureau</Text>
            </TouchableOpacity>
          </View>
        </ScreenContainer>
    );
  }

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title={`Révision Procédure #${complaintId}`} showBack={true} />
      
      <ScrollView 
        style={{ backgroundColor: colors.bgMain }}
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* 🏛️ BANDEAU DE QUALIFICATION */}
        <View style={[styles.infoCard, { backgroundColor: primaryColor }]}>
          <View style={styles.headerIconRow}>
            <Ionicons name="shield-checkmark" size={22} color="#FFF" />
            <Text style={styles.whiteLabel}>VISA DU COMMISSAIRE REQUIS</Text>
          </View>
          <Text style={styles.whiteOffenceTitle}>
            {complaint.provisionalOffence || complaint.title || "Information Judiciaire"}
          </Text>
        </View>

        {/* 👤 EXPOSÉ DES FAITS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={18} color={primaryColor} />
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Déclaration du Plaignant</Text>
          </View>
          <View style={[styles.textContainer, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.description, { color: colors.textMain }]}>
              {complaint.description || "Aucune déclaration enregistrée."}
            </Text>
          </View>
        </View>

        {/* 📋 SYNTHÈSE OPJ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={18} color={primaryColor} />
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Synthèse de l'Enquête (OPJ)</Text>
          </View>
          <View style={[
            styles.textContainer, 
            { 
              backgroundColor: colors.pvBg, 
              borderLeftColor: primaryColor, 
              borderLeftWidth: 5,
              borderColor: colors.border
            }
          ]}>
            <Text style={[styles.pvText, { color: colors.textMain }]}>
              {(complaint as any).pvDetails || "En attente du rapport de synthèse final de l'Officier de Police Judiciaire."}
            </Text>
          </View>
        </View>

        {/* 📂 INVENTAIRE DES SCELLÉS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 15, fontSize: 12, color: colors.textSub }]}>REGISTRE DES SCELLÉS</Text>
          {(complaint as any).attachments?.length > 0 ? (
            <View style={styles.attachmentGrid}>
              {(complaint as any).attachments.map((file: any) => (
                <View 
                  key={file.id} 
                  style={[styles.attachmentBadge, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
                >
                  <Ionicons name="cube-outline" size={16} color={primaryColor} />
                  <Text style={[styles.fileName, { color: colors.textMain }]} numberOfLines={1}>
                    Scellé #{file.id}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyBox, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Text style={[styles.noData, { color: colors.textSub }]}>Aucune pièce à conviction répertoriée.</Text>
            </View>
          )}
        </View>

        {/* ⚡ ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity 
            activeOpacity={0.85}
            style={[styles.btn, { backgroundColor: "#10B981" }]}
            onPress={handleSign}
            disabled={signMutation.isPending || rejectMutation.isPending}
          >
            {signMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="ribbon-outline" size={26} color="#FFF" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.btnText}>APPOSER LE VISA</Text>
                  <Text style={styles.btnSubText}>Certifier et transmettre au Procureur</Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.btnSecondary, { borderColor: "#EF4444" }]}
            onPress={() => Alert.alert("Renvoyer le dossier", "Confirmer le renvoi à l'OPJ ?", [{text: "Annuler"}, {text: "Confirmer", onPress: () => rejectMutation.mutate()}])}
            disabled={signMutation.isPending || rejectMutation.isPending}
          >
            {rejectMutation.isPending ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <Text style={[styles.btnSecondaryText, { color: "#EF4444" }]}>
                Renvoyer pour complément d'enquête
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 15, fontWeight: "700", fontSize: 13, letterSpacing: 1 },
  scroll: { padding: 16 },
  
  infoCard: { padding: 24, borderRadius: 28, marginBottom: 25, ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10 }, android: { elevation: 6 } }) },
  headerIconRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  whiteLabel: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  whiteOffenceTitle: { color: "#FFF", fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 13, fontWeight: "900", textTransform: 'uppercase', letterSpacing: 1 },
  
  textContainer: { padding: 20, borderRadius: 24, borderWidth: 1.5 },
  description: { fontSize: 15, lineHeight: 24, fontWeight: "500" },
  pvText: { fontSize: 15, lineHeight: 24, fontStyle: 'italic', fontWeight: "600" },
  
  attachmentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  attachmentBadge: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, gap: 10, width: '48%', borderWidth: 1.5 },
  fileName: { fontSize: 12, fontWeight: '800' },
  emptyBox: { padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed' },
  noData: { fontStyle: 'italic', fontSize: 13, fontWeight: "600" },
  
  actions: { marginTop: 10, gap: 14 },
  btn: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 22, 
    borderRadius: 24, 
    gap: 15, 
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
        android: { elevation: 4 },
        web: { boxShadow: "0px 4px 15px rgba(0,0,0,0.15)" }
    })
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
  btnSubText: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "600", marginTop: 2 },
  
  btnSecondary: { padding: 20, borderRadius: 24, borderWidth: 2, alignItems: "center" },
  btnSecondaryText: { fontSize: 13, fontWeight: "900", textTransform: 'uppercase', letterSpacing: 0.5 }
});