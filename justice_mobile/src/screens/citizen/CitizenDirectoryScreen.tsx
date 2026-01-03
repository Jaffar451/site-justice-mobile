import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Linking, 
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// ✅ 1. Imports Architecture
import { useAppTheme } from '../../theme/AppThemeProvider';
import { CitizenScreenProps } from '../../types/navigation';

// Composants
import ScreenContainer from '../../components/layout/ScreenContainer';
import AppHeader from '../../components/layout/AppHeader';
import SmartFooter from '../../components/layout/SmartFooter';

const CATEGORIES = ['Tous', 'Lois', 'Annuaires', 'Assistance'];

const RESOURCES = [
  { 
    id: '1', 
    category: 'Lois',
    title: 'Code Pénal & Procédure', 
    subtitle: 'Consultez ou téléchargez le texte intégral.', 
    icon: 'book-outline', 
    type: 'pdf', 
    link: 'https://justice.gouv.ne/codes/code_penal_niger.pdf' 
  },
  { 
    id: '2', 
    category: 'Lois',
    title: 'Code de la Famille', 
    subtitle: 'Mariage, héritage et droits des enfants.', 
    icon: 'people-outline', 
    type: 'pdf', 
    link: 'https://justice.gouv.ne/codes/code_famille_niger.pdf' 
  },
  { 
    id: '3', 
    category: 'Annuaires',
    title: 'Annuaire des Avocats', 
    subtitle: 'Liste officielle du Barreau du Niger.', 
    icon: 'briefcase-outline', 
    type: 'web', 
    link: 'https://avocats-niger.org' 
  },
  { 
    id: '4', 
    category: 'Assistance',
    title: 'Aide Juridictionnelle (BAJ)', 
    subtitle: 'Demander l\'assistance d\'un avocat d\'office.', 
    icon: 'hand-left-outline', 
    type: 'call', 
    link: 'tel:1234' 
  },
  { 
    id: '5', 
    category: 'Annuaires',
    title: 'Chambre des Huissiers', 
    subtitle: 'Pour vos significations et exécutions.', 
    icon: 'document-text-outline', 
    type: 'web', 
    link: 'https://huissiers-niger.org' 
  },
];

export default function CitizenDirectoryScreen({ navigation }: CitizenScreenProps<'CitizenDirectory'>) {
  const { theme, isDark } = useAppTheme();
  const primaryColor = theme.colors.primary;
  
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Tous');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // 🎨 PALETTE DYNAMIQUE
  const colors = {
    bgMain: isDark ? "#0F172A" : "#F8FAFC",
    bgCard: isDark ? "#1E293B" : "#FFFFFF",
    textMain: isDark ? "#FFFFFF" : "#1E293B",
    textSub: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
  };

  // ✅ LOGIQUE DE TÉLÉCHARGEMENT & PARTAGE (Mobile)
  const handleDownload = async (item: typeof RESOURCES[0]) => {
    if (Platform.OS === 'web') {
      Linking.openURL(item.link);
      return;
    }

    try {
      setDownloadingId(item.id);
      const filename = `${item.title.replace(/\s+/g, '_')}.pdf`;
      const fileUri = FileSystem.cacheDirectory + filename;

      // Téléchargement du fichier
      const downloadRes = await FileSystem.downloadAsync(item.link, fileUri);

      if (downloadRes.status === 200) {
        // Vérifier si le partage est disponible et ouvrir le fichier
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadRes.uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Consulter : ${item.title}`,
          });
        } else {
          Alert.alert("Succès", "Fichier téléchargé dans le cache de l'application.");
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de récupérer le document. Vérifiez votre connexion.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePress = async (item: typeof RESOURCES[0]) => {
    if (item.type === 'pdf') {
      handleDownload(item);
    } else {
      const supported = await Linking.canOpenURL(item.link);
      if (supported) {
        await Linking.openURL(item.link);
      }
    }
  };

  const filteredData = useMemo(() => {
    return RESOURCES.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                            item.subtitle.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCat === 'Tous' || item.category === selectedCat;
      return matchesSearch && matchesCat;
    });
  }, [search, selectedCat]);

  const renderItem = ({ item }: { item: typeof RESOURCES[0] }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
      onPress={() => handlePress(item)}
    >
      <View style={[styles.iconBox, { backgroundColor: primaryColor + '15' }]}>
        <Ionicons name={item.icon as any} size={24} color={primaryColor} />
      </View>

      <View style={styles.contentBox}>
        <Text style={[styles.cardTitle, { color: colors.textMain }]}>{item.title}</Text>
        <Text style={[styles.cardSub, { color: colors.textSub }]}>{item.subtitle}</Text>
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
      
      <View style={[styles.main, { backgroundColor: colors.bgMain }]}>
        
        {/* 🔍 HEADER & RECHERCHE */}
        <View style={[styles.headerSection, { backgroundColor: primaryColor }]}>
          <Text style={styles.headerTitle}>Droits & Assistance</Text>
          <Text style={styles.headerDesc}>Informations juridiques et textes de lois du Niger.</Text>
          
          <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.bgCard : '#FFF' }]}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput 
              placeholder="Rechercher une loi, un avocat..." 
              placeholderTextColor="#94A3B8"
              style={[styles.searchInput, { color: colors.textMain }]}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* 🏷️ FILTRES CATEGORIES */}
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat}
                onPress={() => setSelectedCat(cat)}
                style={[
                  styles.catChip, 
                  { 
                    backgroundColor: selectedCat === cat ? primaryColor : colors.bgCard,
                    borderColor: selectedCat === cat ? primaryColor : colors.border
                  }
                ]}
              >
                <Text style={[styles.catText, { color: selectedCat === cat ? '#FFF' : colors.textSub }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
                <Ionicons name="search-outline" size={48} color={colors.textSub} />
                <Text style={[styles.emptyText, { color: colors.textSub }]}>Aucun résultat pour cette recherche.</Text>
            </View>
          }
        />

        {/* 🆘 BOUTON D'URGENCE FIXE */}
        <View style={styles.urgentWrapper}>
          <TouchableOpacity 
            activeOpacity={0.9}
            style={[styles.urgentCard, { backgroundColor: isDark ? "#064e3b" : "#DCFCE7" }]}
            onPress={() => Linking.openURL('tel:1234')}
          >
            <View style={styles.urgentIcon}>
              <Ionicons name="call" size={24} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.urgentTitle, { color: isDark ? "#4ade80" : "#14532D" }]}>
                NUMÉRO VERT JUSTICE
              </Text>
              <Text style={[styles.urgentSub, { color: isDark ? "#bbf7d0" : "#166534" }]}>
                Appel Gratuit 24h/7j : <Text style={{ fontWeight: '900' }}>1234</Text>
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <SmartFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1 },
  headerSection: { 
    padding: 24, 
    paddingBottom: 25, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    zIndex: 10 
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  headerDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 20, lineHeight: 18 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 16, 
    height: 54, 
    paddingHorizontal: 16,
    ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
        android: { elevation: 5 }
    })
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600' },
  catList: { paddingHorizontal: 16, paddingVertical: 15 },
  catChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1 },
  catText: { fontSize: 13, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 240 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 22, 
    marginBottom: 12, 
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10 },
      android: { elevation: 2 }
    })
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  contentBox: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  cardSub: { fontSize: 12, lineHeight: 16 },
  actionIcon: { width: 32, justifyContent: 'center', alignItems: 'center' },
  urgentWrapper: { position: 'absolute', bottom: 95, left: 16, right: 16 },
  urgentCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
    ...Platform.select({
      ios: { shadowColor: "#16A34A", shadowOpacity: 0.2, shadowRadius: 15 },
      android: { elevation: 8 },
    })
  },
  urgentIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15, backgroundColor: "#16A34A" },
  urgentTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  urgentSub: { fontSize: 13, marginTop: 2 },
  emptyBox: { alignItems: 'center', marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 15, fontWeight: '600' }
});