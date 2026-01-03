import React, { useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  TouchableOpacity, 
  Switch, 
  StatusBar, 
  Platform
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// ✅ Architecture & Thème
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Hook dynamique
import { getUserById, deleteUser, updateUser, UserData } from "../../services/user.service"; 

// Composants
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter";

export default function AdminUserDetailsScreen() {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const userId = route.params?.userId || route.params?.id;

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    dangerBg: isDark ? "#450A0A" : "#FEF2F2",
    dangerBorder: isDark ? "#7F1D1D" : "#EF444450",
  };

  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });

  const user: UserData | null = useMemo(() => {
    if (!rawData) return null;
    const d = rawData as any;
    return d.data || d.user || d;
  }, [rawData]);

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (Platform.OS === 'web') window.alert("Compte révoqué avec succès.");
      navigation.goBack();
    },
    onError: (err: any) => Alert.alert("Erreur", err.response?.data?.message || "Échec de suppression.")
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: boolean) => updateUser(userId, { isActive: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] }); 
      queryClient.invalidateQueries({ queryKey: ["users"] }); 
    },
  });

  const generatePDF = async () => {
    if (!user) return;
    const nomComplet = `${user.firstname} ${(user.lastname || "").toUpperCase()}`;
    const html = `
      <html>
        <body style="font-family: sans-serif; padding: 40px; color: #1e293b;">
          <h1 style="text-align: center; color: #1e3a8a;">RÉPUBLIQUE DU NIGER</h1>
          <h2 style="text-align: center;">FICHE D'HABILITATION JUSTICE</h2>
          <hr style="border: 1px solid #e2e8f0;"/>
          <div style="margin-top: 30px; font-size: 16px;">
            <p><strong>Agent :</strong> ${nomComplet}</p>
            <p><strong>Rôle :</strong> ${(user.role || "Inconnu").toUpperCase()}</p>
            <p><strong>Matricule :</strong> ${(user as any).matricule || "N/A"}</p>
            <p><strong>Organisation :</strong> ${user.organization || 'Non défini'}</p>
            <p><strong>Statut :</strong> ${user.isActive ? 'ACTIF' : 'SUSPENDU'}</p>
          </div>
        </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e) { Alert.alert("Erreur", "Génération PDF échouée."); }
  };

  const handleDelete = () => {
    const title = "⚠️ RÉVOCATION ACCÈS";
    const msg = "Voulez-vous supprimer définitivement cet agent du registre national ?";
    if (Platform.OS === 'web') {
        if (window.confirm(`${title}\n\n${msg}`)) deleteMutation.mutate(userId);
    } else {
        Alert.alert(title, msg, [
          { text: "Annuler", style: "cancel" },
          { text: "RÉVOQUER", style: "destructive", onPress: () => deleteMutation.mutate(userId) }
        ]);
    }
  };

  if (isLoading) return (
    <ScreenContainer withPadding={false}>
      <AppHeader title="Fiche Agent" showBack />
      <View style={[styles.center, { backgroundColor: colors.bgMain }]}><ActivityIndicator size="large" color={primaryColor} /></View>
    </ScreenContainer>
  );

  if (error || !user) return (
    <ScreenContainer withPadding={false}>
       <AppHeader title="Erreur" showBack />
       <View style={[styles.center, { backgroundColor: colors.bgMain }]}>
          <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
          <Text style={{color: colors.textMain, marginTop: 15, fontWeight: '700'}}>Agent introuvable</Text>
       </View>
    </ScreenContainer>
  );

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Fiche d'Agent" showBack={true} />
      
      <View style={[styles.mainWrapper, { backgroundColor: colors.bgMain }]}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER PROFIL */}
          <View style={styles.headerSection}>
            <View style={[styles.avatarBox, { backgroundColor: primaryColor + "15" }]}>
              <Ionicons name="person-circle-outline" size={120} color={primaryColor} />
            </View>
            
            <Text style={[styles.nameText, { color: colors.textMain }]}>
              {user.firstname} {(user.lastname || "").toUpperCase()}
            </Text>
            
            <View style={[styles.roleBadge, { backgroundColor: primaryColor + "15" }]}>
              <Text style={[styles.roleText, { color: primaryColor }]}>
                  {(user.role || "Agent").toUpperCase()}
              </Text>
            </View>

            <View style={[styles.statusBox, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
               <View style={styles.statusLabelGroup}>
                  <View style={[styles.dot, { backgroundColor: user.isActive ? "#10B981" : "#EF4444" }]} />
                  <Text style={[styles.statusTitle, { color: colors.textMain }]}>
                    {user.isActive ? "ACCÈS OPÉRATIONNEL" : "ACCÈS RÉVOQUÉ"}
                  </Text>
               </View>
               <Switch 
                  value={user.isActive || false} 
                  onValueChange={(val) => statusMutation.mutate(val)}
                  thumbColor="#FFF"
                  trackColor={{ false: "#CBD5E1", true: "#10B981" }}
               />
            </View>
          </View>

          {/* ACTIONS RAPIDES */}
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.actionBtn, { backgroundColor: primaryColor }]}
              onPress={() => navigation.navigate("AdminEditUser", { userId: user.id })}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Éditer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.actionBtn, { backgroundColor: colors.textSub }]}
              onPress={generatePDF}
            >
              <Ionicons name="print-outline" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Certifier (PDF)</Text>
            </TouchableOpacity>
          </View>

          {/* DÉTAILS ADMINISTRATIVE */}
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Information de Service</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <InfoRow 
              icon="barcode-outline" 
              label="Matricule" 
              value={(user as any)?.matricule || (user as any)?.registrationNumber} 
              primaryColor={primaryColor} 
              colors={colors}
            />
            <InfoRow icon="business-outline" label="Organisation" value={user.organization} primaryColor={primaryColor} colors={colors} />
            <InfoRow icon="mail-outline" label="Email Pro" value={user.email} primaryColor={primaryColor} colors={colors} />
            <InfoRow icon="call-outline" label="Téléphone" value={user.telephone} primaryColor={primaryColor} isLast colors={colors} />
          </View>

          {/* ZONE DE DANGER */}
          <Text style={[styles.sectionTitle, { color: "#EF4444", marginTop: 35 }]}>SÉCURITÉ ADMINISTRATIVE</Text>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.dangerCard, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]} 
            onPress={handleDelete}
          >
            <View style={[styles.dangerIconBox, { backgroundColor: isDark ? "#7F1D1D" : "#EF444415" }]}>
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dangerTitle}>Révocation Définitive</Text>
              <Text style={[styles.dangerSub, { color: isDark ? "#FCA5A5" : colors.textSub }]}>Retrait irréversible des droits système</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
          </TouchableOpacity>

          <View style={{ height: 140 }} />
        </ScrollView>
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const InfoRow = ({ icon, label, value, primaryColor, isLast, colors }: any) => (
  <View style={[styles.infoRowInternal, { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.border }]}>
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={primaryColor} />
      <Text style={[styles.infoLabel, { color: colors.textSub }]}>{label}</Text>
    </View>
    <Text style={[styles.infoValue, { color: colors.textMain }]}>{value || "—"}</Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainWrapper: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  
  headerSection: { alignItems: "center", marginBottom: 30 },
  avatarBox: { marginBottom: 20, borderRadius: 60, padding: 5 },
  nameText: { fontSize: 24, fontWeight: "900", textAlign: 'center', letterSpacing: -0.8 },
  roleBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginTop: 10 },
  roleText: { fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  
  statusBox: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    width: '100%', marginTop: 30, padding: 20, borderRadius: 28, borderWidth: 1.5
  },
  statusLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  statusTitle: { fontSize: 13, fontWeight: "900", letterSpacing: 0.5 },
  
  actionGrid: { flexDirection: 'row', gap: 15, marginBottom: 35 },
  actionBtn: { 
    flex: 1, flexDirection: 'row', height: 60, borderRadius: 20, justifyContent: 'center', 
    alignItems: 'center', gap: 10, ...Platform.select({ android: { elevation: 3 }, ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 } })
  },
  actionBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  
  sectionTitle: { fontSize: 11, fontWeight: "900", marginBottom: 15, letterSpacing: 1.5, textTransform: 'uppercase' },
  infoCard: { borderRadius: 32, borderWidth: 1.5, overflow: "hidden" },
  infoRowInternal: { flexDirection: "row", justifyContent: "space-between", padding: 20, alignItems: 'center' },
  infoLabel: { marginLeft: 12, fontSize: 14, fontWeight: '700' },
  infoValue: { fontWeight: "900", fontSize: 15 },
  
  dangerCard: { 
    flexDirection: 'row', alignItems: 'center', padding: 22, borderRadius: 28, 
    borderWidth: 2, borderStyle: 'dashed', gap: 18
  },
  dangerIconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  dangerTitle: { color: "#EF4444", fontWeight: "900", fontSize: 16 },
  dangerSub: { fontSize: 12, fontWeight: '600', marginTop: 2 }
});