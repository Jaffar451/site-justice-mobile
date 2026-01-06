// PATH: src/screens/citizen/CitizenDirectoryScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, 
  Linking, Platform, StatusBar, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Architecture & Thème
import { useAppTheme } from '../../theme/AppThemeProvider';
import { CitizenScreenProps } from '../../types/navigation';
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';

// Services
import api from '../../services/api'; 
import { downloadAndSave } from '../../services/download.service'; 

const CATEGORIES = ['Tous', 'Lois', 'Annuaires', 'Assistance'];

export default function CitizenDirectoryScreen({ navigation }: CitizenScreenProps<'CitizenDirectory'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;

  // Gestion de la bordure (fix pour thème personnalisé)
  const borderColor = isDark ? 'rgba(255,255,255,0.15)' : '#E2E8F0';
  
  // États
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Tous');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // États pour les données dynamiques
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. CHARGEMENT DES DONNÉES DEPUIS LE BACKEND
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("📥 [Directory] Démarrage du chargement des données..."); // LOG DEBUG

      const [resTexts, resLawyers] = await Promise.all([
        api.get('/resources/legal-texts'),
        api.get('/resources/lawyers')
      ]);

      const texts = resTexts.data.data || [];
      const lawyers = resLawyers.data.data || [];

      console.log(`📊 [Directory] Lois reçues : ${texts.length}`);       // LOG DEBUG
      console.log(`📊 [Directory] Avocats reçus : ${lawyers.length}`);   // LOG DEBUG

      const allData = [...texts, ...lawyers];
      
      console.log(`✅ [Directory] TOTAL ITEMS : ${allData.length}`);      // LOG DEBUG
      
      setResources(allData);
    } catch (error) {
      console.error("❌ [Directory] Erreur chargement ressources:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. LOGIQUE DE TÉLÉCHARGEMENT
  const handleDownload = async (item: any) => {
    if (Platform.OS === 'web') {
      Linking.openURL(item.link);
      return;
    }

    try {
      setDownloadingId(item.id);
      await downloadAndSave(item.link, item.title, item.id.toString());

      Alert.alert(
        "Téléchargement réussi ✅", 
        "Le document est disponible hors-ligne dans votre espace.",
        [
          { text: "Continuer" },
          { text: "Ouvrir", onPress: () => navigation.navigate('MyDownloads' as any) }
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de récupérer le document.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePress = async (item: any) => {
    if (item.type === 'pdf') {
      handleDownload(item);
    } else {
      const supported = await Linking.canOpenURL(item.link);
      if (supported) {
        await Linking.openURL(item.link);
      }
    }
  };

  // 3. FILTRAGE
  const filteredData = useMemo(() => {
    return resources.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                            item.subtitle?.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCat === 'Tous' || item.category === selectedCat;
      return matchesSearch && matchesCat;
    });
  }, [search, selectedCat, resources]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: borderColor }]}
      onPress={() => handlePress(item)}
    >
      <View style={[styles.iconBox, { backgroundColor: primaryColor + '15' }]}>
        <Ionicons name={item.icon || 'document-text'} size={24} color={primaryColor} />
      </View>

      <View style={styles.contentBox}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
        <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
      </View>

      <View style={styles.actionIcon}>
        {downloadingId === item.id ? (
          <ActivityIndicator size="small" color={primaryColor} />
        ) : (
          <Ionicons 
            name={item.type === 'pdf' ? 'download-outline' : (item.type === 'call' ? 'call' : 'open-outline')} 
            size={20} 
            color={primaryColor} 
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer withPadding={false}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="Centre de Ressources" showBack />
      
      <View style={[styles.main, { backgroundColor: theme.colors.background }]}>
        
        {/* HEADER & RECHERCHE */}
        <View style={[styles.headerSection, { backgroundColor: primaryColor }]}>
          <Text style={styles.headerTitle}>Droits & Assistance</Text>
          <Text style={styles.headerDesc}>Informations juridiques et textes de lois du Niger.</Text>
          
          <View style={[styles.searchContainer, { backgroundColor: isDark ? theme.colors.surface : '#FFF' }]}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput 
              placeholder="Rechercher une loi, un avocat..." 
              placeholderTextColor="#94A3B8"
              style={[styles.searchInput, { color: theme.colors.text }]}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* BOUTON ACCÈS MES FICHIERS */}
        <View style={{ paddingHorizontal: 16, marginTop: 15 }}>
          <TouchableOpacity 
            style={[styles.myDocsBtn, { backgroundColor: theme.colors.surface, borderColor: borderColor }]}
            onPress={() => navigation.navigate('MyDownloads' as any)}
          >
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="folder-open" size={20} color={primaryColor} style={{ marginRight: 10 }} />
                <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>Ouvrir mon Espace Documentaire</Text>
             </View>
             <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* FILTRES */}
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat}
                onPress={() => setSelectedCat(cat)}
                style={[
                  styles.catChip, 
                  { 
                    backgroundColor: selectedCat === cat ? primaryColor : theme.colors.surface,
                    borderColor: selectedCat === cat ? primaryColor : borderColor
                  }
                ]}
              >
                <Text style={[styles.catText, { color: selectedCat === cat ? '#FFF' : theme.colors.textSecondary }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* LISTE */}
        {loading ? (
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>Chargement des ressources...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                  <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    {resources.length === 0 ? "Aucune donnée reçue du serveur." : "Aucun résultat pour cette recherche."}
                  </Text>
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
  main: { flex: 1 },
  headerSection: { 
    padding: 24, paddingBottom: 25, 
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, zIndex: 10 
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  headerDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 20, lineHeight: 18 },
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', borderRadius: 16, height: 54, paddingHorizontal: 16,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600' },
  myDocsBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 15, borderRadius: 12, borderWidth: 1, elevation: 1
  },
  catList: { paddingHorizontal: 16, paddingVertical: 15 },
  catChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1 },
  catText: { fontSize: 13, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 100 },
  card: { 
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 22, 
    marginBottom: 12, borderWidth: 1, elevation: 2
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  contentBox: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  cardSub: { fontSize: 12, lineHeight: 16 },
  actionIcon: { width: 32, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: 'center', marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 15, fontWeight: '600' }
});