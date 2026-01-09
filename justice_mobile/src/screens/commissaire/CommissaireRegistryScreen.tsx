import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// ✅ Architecture & Store
import { useAppTheme } from '../../theme/AppThemeProvider';
import { useComplaints } from '../../hooks/useComplaints'; // Hook de données
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';

export default function CommissaireRegistryScreen() {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  const navigation = useNavigation<any>();
  
  // État local pour la recherche
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Récupération des données (TanStack Query)
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

  // 🔍 FILTRE ET SÉCURISATION (Anti-Crash)
  const registryData = useMemo(() => {
    // 1. Sécurité : Si pas de data, tableau vide
    if (!data) return [];

    // 2. Normalisation : Gère si l'API renvoie un tableau direct ou un objet { data: [...] }
    const list = Array.isArray(data) ? data : (data.data || []);

    // 3. Sécurité ultime : Si ce n'est toujours pas un tableau, on arrête
    if (!Array.isArray(list)) {
        console.warn("⚠️ Données invalides dans le Registre");
        return [];
    }

    // 4. Filtrage par recherche (Nom, Titre, ou ID)
    if (searchQuery.trim() === "") return list;

    const query = searchQuery.toLowerCase();
    return list.filter((item: any) => 
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.trackingCode && item.trackingCode.toLowerCase().includes(query)) ||
      (item.complainant?.lastname && item.complainant.lastname.toLowerCase().includes(query))
    );
  }, [data, searchQuery]);

  const renderItem = ({ item }: { item: any }) => {
    // Statut couleur
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'cloture': return '#10B981'; // Vert
            case 'transmise_parquet': return '#8B5CF6'; // Violet
            case 'attente_validation': return '#F59E0B'; // Orange
            default: return primaryColor; // Bleu
        }
    };

    return (
      <TouchableOpacity 
        style={[styles.rowCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
        onPress={() => navigation.navigate('CommissaireActionDetail', { id: item.id })}
      >
        {/* Colonne ID & Date */}
        <View style={styles.colId}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.idText, { color: colors.textMain }]}>#{item.trackingCode?.slice(-6) || item.id}</Text>
            <Text style={[styles.dateText, { color: colors.textSub }]}>
                {new Date(item.createdAt).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit'})}
            </Text>
        </View>

        {/* Colonne Infos */}
        <View style={styles.colInfo}>
            <Text style={[styles.titleText, { color: colors.textMain }]} numberOfLines={1}>
                {item.title || "Procédure sans titre"}
            </Text>
            <Text style={[styles.complainantText, { color: colors.textSub }]} numberOfLines={1}>
                Plaignant: {item.complainant?.lastname || "Anonyme"} {item.complainant?.firstname}
            </Text>
        </View>

        {/* Colonne Action */}
        <Ionicons name="chevron-forward" size={20} color={colors.textSub} />
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader title="Registre Central" showBack />

      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        
        {/* 🔦 BARRE DE RECHERCHE */}
        <View style={[styles.searchContainer, { backgroundColor: colors.bgMain, borderBottomColor: colors.border }]}>
            <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Ionicons name="search" size={20} color={colors.textSub} />
                <TextInput 
                    placeholder="Rechercher (Nom, N° PV...)"
                    placeholderTextColor={colors.textSub}
                    style={[styles.input, { color: colors.textMain }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close-circle" size={18} color={colors.textSub} />
                    </TouchableOpacity>
                )}
            </View>
        </View>

        {/* 📋 LISTE DES DOSSIERS */}
        {isLoading ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={primaryColor} />
            </View>
        ) : (
            <FlatList 
                data={registryData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshing={isRefetching}
                onRefresh={refetch}
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={[styles.countText, { color: colors.textSub }]}>
                            {registryData.length} procédure(s) enregistrée(s)
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.centerEmpty}>
                        <Ionicons name="folder-open-outline" size={60} color={colors.textSub} style={{ opacity: 0.5 }} />
                        <Text style={{ color: colors.textSub, marginTop: 10 }}>Aucun dossier trouvé.</Text>
                    </View>
                }
            />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerEmpty: { alignItems: "center", marginTop: 100 },
  
  searchContainer: { padding: 16, borderBottomWidth: 1 },
  searchBar: { 
    flexDirection: 'row', alignItems: 'center', height: 50, 
    borderRadius: 12, paddingHorizontal: 12, borderWidth: 1 
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, height: '100%' },

  listContent: { paddingBottom: 100 },
  listHeader: { paddingHorizontal: 20, paddingVertical: 10 },
  countText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },

  rowCard: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingVertical: 14, paddingHorizontal: 20, 
    borderBottomWidth: 1, borderColor: 'transparent'
  },
  colId: { width: 80 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  idText: { fontSize: 13, fontWeight: '900' },
  dateText: { fontSize: 11 },

  colInfo: { flex: 1, paddingHorizontal: 10 },
  titleText: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  complainantText: { fontSize: 13 },
});