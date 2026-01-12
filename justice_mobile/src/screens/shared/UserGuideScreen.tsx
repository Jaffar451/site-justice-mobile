import React, { useState, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  LayoutAnimation, 
  Platform, 
  UIManager, 
  TextInput,
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../theme/AppThemeProvider"; 
import ScreenContainer from "../../components/layout/ScreenContainer";
import AppHeader from "../../components/layout/AppHeader";
import SmartFooter from "../../components/layout/SmartFooter"; // ✅ Ajout

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function UserGuideScreen() {
  const { theme, isDark } = useAppTheme();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const guideSteps = [
    {
      id: 1,
      title: "Comment déposer une plainte ?",
      icon: "document-text",
      content: "Depuis l'accueil, cliquez sur le bouton 'Déposer une plainte'. Remplissez le formulaire en précisant le lieu, la catégorie et le récit des faits. Vous pouvez ajouter des photos ou des documents. Une fois soumise, vous recevrez un code de suivi (Réf)."
    },
    {
      id: 2,
      title: "Suivre mon dossier",
      icon: "search",
      content: "Allez dans l'onglet 'Mes Plaintes'. Vous verrez la liste de vos dossiers avec leur statut (En cours, Transmis au Parquet, Jugé). Cliquez sur un dossier pour voir les détails et l'avancement chronologique."
    },
    {
      id: 3,
      title: "Fonctionnalité SOS Urgence",
      icon: "alert-circle",
      content: "En cas de danger immédiat, appuyez sur le bouton rouge SOS dans l'en-tête. Cela déclenche une alerte immédiate avec votre géolocalisation vers les unités de secours."
    },
    {
      id: 4,
      title: "Confidentialité des données",
      icon: "shield-checkmark",
      content: "Toutes vos données sont cryptées selon les normes de sécurité de l'État nigérien. Seuls les officiers de police et magistrats assignés à votre dossier peuvent consulter vos informations."
    },
    {
      id: 5,
      title: "Demande de Casier Judiciaire",
      icon: "ribbon",
      content: "Le module 'Casier Judiciaire' vous permet de commander un extrait B3. Vous devrez scanner votre acte de naissance et payer les frais de chancellerie via Mobile Money."
    },
    {
        id: 6,
        title: "Comment vérifier un acte (Scanner) ?",
        icon: "qr-code-outline",
        content: "Utilisez le bouton 'Scanner' ou 'Vérifier Acte' présent sur votre tableau de bord. Scannez le QR Code présent sur le document papier pour confirmer son authenticité via la base de données centrale."
    }
  ];

  // 🔍 Filtrage intelligent pour la FAQ
  const filteredGuide = useMemo(() => {
    return guideSteps.filter(step => 
      step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // 🎨 Palette dynamique
  const colors = {
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    border: isDark ? "#334155" : "#E2E8F0",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    inputBg: isDark ? "#0F172A" : "#F1F5F9",
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Aide & Support" showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* 🔎 BARRE DE RECHERCHE FAQ */}
        <View style={[styles.searchSection, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSub} />
          <TextInput 
            placeholder="Rechercher une aide..."
            placeholderTextColor={colors.textSub}
            style={[styles.searchInput, { color: colors.textMain }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={[styles.introText, { color: colors.textSub }]}>
          Questions fréquemment posées (FAQ)
        </Text>

        {filteredGuide.length > 0 ? (
          filteredGuide.map((step) => {
            const isOpen = expandedId === step.id;
            return (
              <View key={step.id} style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => toggleExpand(step.id)}
                  style={styles.header}
                >
                  <View style={styles.headerLeft}>
                    <View style={[styles.iconBox, { backgroundColor: isOpen ? theme.colors.primary : (isDark ? "#334155" : "#F1F5F9") }]}>
                      <Ionicons name={step.icon as any} size={18} color={isOpen ? "#FFF" : (isDark ? "#FFF" : colors.textSub)} />
                    </View>
                    <Text style={[styles.title, { color: colors.textMain }]}>{step.title}</Text>
                  </View>
                  <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.textSub} />
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.contentBox}>
                      <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      <Text style={[styles.content, { color: isDark ? "#CBD5E1" : "#475569" }]}>
                        {step.content}
                      </Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.noResult}>
            <Ionicons name="search-outline" size={40} color={colors.textSub} />
            <Text style={{color: colors.textSub, marginTop: 10}}>Aucun résultat trouvé.</Text>
          </View>
        )}

        {/* 📞 SECTION CONTACT DIRECT */}
        <View style={styles.contactSection}>
          <Text style={[styles.contactTitle, { color: colors.textMain }]}>Besoin d'une assistance directe ?</Text>
          
          <View style={styles.contactGrid}>
            <TouchableOpacity 
              style={[styles.contactBtn, { backgroundColor: '#0891B2' }]}
              onPress={() => Linking.openURL('tel:1234')}
            >
              <Ionicons name="call" size={24} color="#FFF" />
              <Text style={styles.contactBtnText}>Appeler le 1234</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactBtn, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}
              onPress={() => Linking.openURL('mailto:support@justice.gouv.ne')}
            >
              <Ionicons name="mail" size={24} color={isDark ? "#FFF" : "#1E293B"} />
              <Text style={[styles.contactBtnText, { color: isDark ? "#FFF" : "#1E293B" }]}>Email Support</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={[styles.versionText, { color: colors.textSub }]}>Version 1.0.2 • e-Justice Niger</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer standardisé */}
      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 55,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 2 }
    })
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600' },
  introText: { fontSize: 11, fontWeight: '800', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  card: { borderRadius: 16, marginBottom: 12, borderWidth: 1, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 13, fontWeight: '700', flex: 1 },
  contentBox: { paddingHorizontal: 16, paddingBottom: 20 },
  divider: { height: 1, width: '100%', marginBottom: 12 },
  content: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
  noResult: { alignItems: 'center', marginTop: 30 },
  
  // Contact
  contactSection: { marginTop: 30, padding: 10 },
  contactTitle: { fontSize: 16, fontWeight: '800', marginBottom: 15, textAlign: 'center' },
  contactGrid: { flexDirection: 'row', gap: 12 },
  contactBtn: { 
    flex: 1, 
    height: 100, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 8
  },
  contactBtnText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  versionText: { textAlign: 'center', marginTop: 40, fontSize: 10, fontWeight: 'bold', opacity: 0.5 }
});