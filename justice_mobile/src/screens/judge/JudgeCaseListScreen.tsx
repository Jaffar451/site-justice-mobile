import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  StatusBar, 
  Alert, 
  DimensionValue,
  Platform,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

// ✅ 1. Architecture & Thème
import { useAppTheme } from '../../theme/AppThemeProvider'; 
import { JudgeScreenProps } from '../../types/navigation';
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';

// Services
import api from '../../services/api';

// --- TYPES ---
interface ApiCase {
  id: number;
  trackingCode: string;
  title: string; // Offence
  description: string;
  status: string; // 'transmise_parquet', 'instruction', 'cloture'
  suspectName?: string; // Si dispo dans l'objet principal ou relation
  createdAt: string;
  detentionStatus?: string; // 'liberte', 'detention', 'controle'
}

// Fonction de récupération
const fetchJudgeCases = async () => {
  // On récupère toutes les plaintes assignées au cabinet (ou filtrées par statut)
  const { data } = await api.get('/complaints'); 
  return data as ApiCase[];
};

export default function JudgeCaseList({ navigation }: JudgeScreenProps<'JudgeCaseList'>) {
  // ✅ 2. Thème Dynamique
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const [activeTab, setActiveTab] = useState<'new' | 'ongoing'>('new');
  const [searchQuery, setSearchQuery] = useState('');

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#1E293B" : "#FFFFFF",
    tabActive: primaryColor + (isDark ? "30" : "15"),
  };

  // Récupération Données Réelles
  const { data: rawCases, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['judge-cases'],
    queryFn: fetchJudgeCases
  });

  // Filtrage et Transformation
  const filteredData = useMemo(() => {
    if (!rawCases) return [];

    return rawCases.filter(c => {
        // Logique de tri par onglet
        const isNew = c.status === 'transmise_parquet' || c.status === 'attente_validation'; // Nouveaux dossiers
        const isOngoing = c.status === 'instruction' || c.status === 'en_cours'; // Dossiers en cours

        if (activeTab === 'new' && !isNew) return false;
        if (activeTab === 'ongoing' && !isOngoing) return false;

        // Logique de recherche
        const search = searchQuery.toLowerCase();
        return (
            (c.title && c.title.toLowerCase().includes(search)) ||
            (c.trackingCode && c.trackingCode.toLowerCase().includes(search)) ||
            (c.suspectName && c.suspectName.toLowerCase().includes(search))
        );
    }).map(c => ({
        // Mapping vers format UI
        id: c.trackingCode || `RG-${c.id}`,
        dbId: c.id,
        type: (c.status === 'transmise_parquet' || c.status === 'attente_validation') ? 'new' : 'ongoing',
        offence: c.title || "Qualification en attente",
        suspect: c.suspectName || "Inconnu (X)",
        dateReceived: new Date(c.createdAt).toLocaleDateString('fr-FR'),
        detentionStatus: c.detentionStatus || "Libre",
        progress: c.status === 'cloture' ? 100 : (c.status === 'instruction' ? 50 : 0)
    }));
  }, [rawCases, activeTab, searchQuery]);

  const handleEnrollment = (item: any) => {
    const title = "Enrôlement du Réquisitoire";
    const msg = `Accepter le dossier ${item.id} et convoquer le suspect pour Première Comparution ?`;

    if (Platform.OS === 'web') {
        const confirm = window.confirm(`${title} : ${msg}`);
        if (confirm) navigation.navigate('CaseDetail', { caseId: item.dbId });
    } else {
        Alert.alert(title, msg, [
          { text: "Plus tard", style: "cancel" },
          { text: "Enrôler", onPress: () => navigation.navigate('CaseDetail', { caseId: item.dbId }) }
        ]);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isNew = activeTab === 'new';

    return (
      <TouchableOpacity 
        style={[
            styles.card, 
            { backgroundColor: colors.bgCard, borderColor: isNew ? primaryColor : colors.border },
            isNew && { borderLeftWidth: 8 }
        ]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CaseDetail', { caseId: item.dbId })}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.rgNumber, { color: isNew ? primaryColor : colors.textSub }]}>{item.id}</Text>
            {item.detentionStatus === 'Mandat de Dépôt' && (
              <View style={[styles.mdBadge, { backgroundColor: isDark ? "#450A0A" : "#FEE2E2" }]}>
                <Ionicons name="lock-closed" size={10} color="#EF4444" />
                <Text style={styles.mdText}>M.D.</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.offenceTitle, { color: colors.textMain }]} numberOfLines={2}>{item.offence}</Text>
          
          <View style={styles.row}>
            <Ionicons name="person-outline" size={14} color={colors.textSub} />
            <Text style={[styles.suspectText, { color: colors.textSub }]}>
                Inculpé : <Text style={[styles.bold, { color: colors.textMain }]}>{item.suspect}</Text>
            </Text>
          </View>

          {!isNew && (
            <View style={[styles.progressContainer, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${item.progress || 0}%` as DimensionValue, 
                    backgroundColor: primaryColor 
                  }
                ]} 
              />
            </View>
          )}

          {isNew ? (
              <View style={[styles.newActionRow, { borderTopColor: colors.border }]}>
                <Text style={styles.receivedTime}>Reçu : {item.dateReceived}</Text>
                <TouchableOpacity 
                  style={[styles.enrollBtn, { backgroundColor: primaryColor }]}
                  onPress={() => handleEnrollment(item)}
                >
                  <Text style={styles.enrollText}>ENRÔLER</Text>
                  <Ionicons name="enter-outline" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
          ) : (
            <View style={styles.footerRow}>
               <Text style={[styles.statusText, { color: colors.textSub }]}>{item.detentionStatus}</Text>
               <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Rôle d'Instruction" showBack />

      <View style={[styles.filterSection, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSub} />
          <TextInput 
            placeholder="Chercher un inculpé, un RG..." 
            placeholderTextColor={colors.textSub}
            style={[styles.searchInput, { color: colors.textMain }]}
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[
                styles.tab, 
                { borderColor: colors.border },
                activeTab === 'new' && { backgroundColor: colors.tabActive, borderColor: primaryColor }
            ]}
            onPress={() => setActiveTab('new')}
          >
            <Text style={[styles.tabText, { color: colors.textSub }, activeTab === 'new' && { color: primaryColor, fontWeight: '900' }]}>
              Nouveaux PV
            </Text>
            {activeTab === 'new' && filteredData.length > 0 && <View style={[styles.badgeDot, { backgroundColor: '#EF4444' }]} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
                styles.tab, 
                { borderColor: colors.border },
                activeTab === 'ongoing' && { backgroundColor: colors.tabActive, borderColor: primaryColor }
            ]}
            onPress={() => setActiveTab('ongoing')}
          >
            <Text style={[styles.tabText, { color: colors.textSub }, activeTab === 'ongoing' && { color: primaryColor, fontWeight: '900' }]}>
              En Instruction
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        {isLoading ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={primaryColor} />
            </View>
        ) : (
            <FlatList 
                data={filteredData}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={primaryColor} />
                }
                ListEmptyComponent={
                <View style={styles.emptyView}>
                    <Ionicons name="file-tray-outline" size={60} color={colors.border} />
                    <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucun dossier dans cette section.</Text>
                </View>
                }
            />
        )}
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterSection: { padding: 20, paddingBottom: 15, borderBottomWidth: 1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 50, borderRadius: 16, marginBottom: 15, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '600' },
  
  tabs: { flexDirection: 'row', gap: 10 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 14, borderWidth: 1, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  tabText: { fontSize: 12, fontWeight: '600' },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },

  listContent: { padding: 20, paddingBottom: 140 },
  card: { borderRadius: 24, marginBottom: 16, borderWidth: 1, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 3 } }) },
  
  cardContent: { padding: 18 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  rgNumber: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  mdBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  mdText: { fontSize: 10, fontWeight: '900', color: '#EF4444' },
  
  offenceTitle: { fontSize: 17, fontWeight: '800', marginBottom: 10, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  suspectText: { fontSize: 13 },
  bold: { fontWeight: '900' },
  
  progressContainer: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  progressBar: { height: '100%', borderRadius: 3 },
  
  newActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 15, borderTopWidth: 1 },
  receivedTime: { fontSize: 11, color: '#94A3B8', fontStyle: 'italic', fontWeight: '600' },
  enrollBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, gap: 8 },
  enrollText: { color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusText: { fontSize: 11, fontWeight: '800' },
  
  emptyView: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { marginTop: 15, fontWeight: '700', textAlign: 'center' }
});