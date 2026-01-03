import React, { useState, useMemo } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  StatusBar,
  Platform
} from 'react-native';
import { Text, Searchbar, Chip, Portal, Modal, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// ✅ Architecture
import { useAppTheme } from '../../theme/AppThemeProvider'; // Hook dynamique
import { useComplaints } from '../../hooks/useComplaints';
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';

export default function CommissaireRegistryScreen() {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const navigation = useNavigation<any>();
  
  // 🔍 États des filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [activePriority, setActivePriority] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Données via TanStack Query
  const { data, isLoading, refetch, isRefetching } = useComplaints();

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    inputBg: isDark ? "#1E293B" : "#FFFFFF",
  };

  // 🏛️ Logique de Filtrage Avancé
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item: any) => {
      const matchesSearch = (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.trackingCode || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = activeStatus ? item.status === activeStatus : true;
      const matchesPriority = activePriority ? item.priority === activePriority : true;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [data, searchQuery, activeStatus, activePriority]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "attente_validation": return { color: "#8B5CF6", label: "À VISER", bg: isDark ? "#2E1065" : "#F3E8FF" };
      case "en_cours_OPJ": return { color: "#3B82F6", label: "ENQUÊTE", bg: isDark ? "#172554" : "#EFF6FF" };
      case "transmise_parquet": return { color: "#10B981", label: "DÉFÉRÉ", bg: isDark ? "#064E3B" : "#DCFCE7" };
      default: return { color: colors.textSub, label: "AUTRE", bg: colors.border };
    }
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Archives & Registre" showBack />

      {/* 🔍 Zone de recherche et bouton filtres */}
      <View style={[styles.headerControls, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
        <Searchbar
          placeholder="Rechercher RG ou Titre..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: colors.bgMain, borderColor: colors.border }]}
          placeholderTextColor={colors.textSub}
          iconColor={primaryColor}
          inputStyle={{ color: colors.textMain }}
        />
        <TouchableOpacity 
          style={[styles.filterBtn, { backgroundColor: (activeStatus || activePriority) ? primaryColor : (isDark ? "#334155" : '#F1F5F9') }]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={24} color={(activeStatus || activePriority) ? '#FFF' : colors.textSub} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        {/* 🏷️ Chips des filtres actifs */}
        {(activeStatus || activePriority) && (
            <View style={styles.activeFiltersRow}>
            {activeStatus && (
                <Chip icon="close" onClose={() => setActiveStatus(null)} style={styles.activeChip} textStyle={{ fontSize: 10 }}>
                Statut: {activeStatus.replace(/_/g, ' ')}
                </Chip>
            )}
            {activePriority && (
                <Chip icon="close" onClose={() => setActivePriority(null)} style={styles.activeChip} textStyle={{ fontSize: 10 }}>
                Priorité: {activePriority.toUpperCase()}
                </Chip>
            )}
            </View>
        )}

        {isLoading ? (
            <View style={styles.center}><ActivityIndicator size="large" color={primaryColor} /></View>
        ) : (
            <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listPadding}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={primaryColor} />}
            renderItem={({ item }) => {
                const status = getStatusInfo(item.status);
                return (
                <TouchableOpacity 
                    style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]} 
                    onPress={() => navigation.navigate('ComplaintDetail', { id: item.id })}
                >
                    <View style={styles.cardTop}>
                    <Text style={[styles.rgNum, { color: colors.textSub }]}>RG-{item.trackingCode}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                    </View>
                    </View>
                    <Text style={[styles.title, { color: colors.textMain }]}>{item.title}</Text>
                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                    <Text style={[styles.opjName, { color: colors.textSub }]}>
                        <Ionicons name="person-outline" size={12} /> {item.opjName || 'N/A'}
                    </Text>
                    <Text style={[styles.date, { color: colors.textSub }]}>{new Date(item.filedAt).toLocaleDateString('fr-FR')}</Text>
                    </View>
                </TouchableOpacity>
                );
            }}
            />
        )}
      </View>

      {/* 🛡️ MODAL DE FILTRES AVANCÉS */}
      <Portal>
        <Modal 
            visible={showFilters} 
            onDismiss={() => setShowFilters(false)} 
            contentContainerStyle={[styles.modalContent, { backgroundColor: colors.bgCard }]}
        >
          <Text style={[styles.modalTitle, { color: colors.textMain }]}>Filtrer le Registre</Text>
          
          <Text style={[styles.filterLabel, { color: colors.textSub }]}>STATUT DU DOSSIER</Text>
          <View style={styles.chipGroup}>
            {['en_cours_OPJ', 'attente_validation', 'transmise_parquet'].map((s) => (
              <Chip 
                key={s} 
                selected={activeStatus === s} 
                onPress={() => setActiveStatus(activeStatus === s ? null : s)}
                style={[styles.chip, activeStatus === s && { backgroundColor: primaryColor }]}
                selectedColor={activeStatus === s ? '#FFF' : primaryColor}
              >
                {getStatusInfo(s).label}
              </Chip>
            ))}
          </View>

          <Text style={[styles.filterLabel, { color: colors.textSub }]}>URGENCE / PRIORITÉ</Text>
          <View style={styles.chipGroup}>
            {['high', 'normal', 'low'].map((p) => (
              <Chip 
                key={p} 
                selected={activePriority === p} 
                onPress={() => setActivePriority(activePriority === p ? null : p)}
                style={[styles.chip, activePriority === p && { backgroundColor: primaryColor }]}
                selectedColor={activePriority === p ? '#FFF' : primaryColor}
              >
                {p.toUpperCase()}
              </Chip>
            ))}
          </View>

          <Button 
            mode="contained" 
            onPress={() => setShowFilters(false)} 
            style={{ marginTop: 30, backgroundColor: primaryColor }}
            contentStyle={{ height: 50 }}
          >
            Appliquer les filtres
          </Button>
          <Button 
            onPress={() => { setActiveStatus(null); setActivePriority(null); setShowFilters(false); }} 
            textColor="#EF4444"
            style={{ marginTop: 10 }}
          >
            Réinitialiser
          </Button>
        </Modal>
      </Portal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerControls: { flexDirection: 'row', padding: 15, gap: 10, borderBottomWidth: 1 },
  searchBar: { flex: 1, elevation: 0, borderRadius: 12, borderWidth: 1, height: 50 },
  filterBtn: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  activeFiltersRow: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, gap: 8, flexWrap: 'wrap' },
  activeChip: { height: 32 },
  listPadding: { padding: 15, paddingBottom: 140 },
  card: { padding: 18, borderRadius: 24, marginBottom: 16, borderWidth: 1, ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 2 } }) },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rgNum: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusLabel: { fontSize: 10, fontWeight: '900' },
  title: { fontSize: 16, fontWeight: '900', marginBottom: 15 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 12 },
  opjName: { fontSize: 12, fontWeight: '700' },
  date: { fontSize: 12, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: 25, margin: 20, borderRadius: 32 },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20 },
  filterLabel: { fontSize: 10, fontWeight: '900', marginTop: 20, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { marginBottom: 5 }
});