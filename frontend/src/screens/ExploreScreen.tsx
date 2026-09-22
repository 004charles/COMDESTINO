import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { tourismApi, PontoTuristico } from '../services/api';
import { colors } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Explore'>;

const CATEGORIAS = [
  { key: '', label: 'Tudo' },
  { key: 'quedas', label: 'Quedas' },
  { key: 'parque', label: 'Parques' },
  { key: 'praia', label: 'Praias' },
  { key: 'historia', label: 'História' },
  { key: 'cultura', label: 'Cultura' },
  { key: 'montanha', label: 'Montanhas' },
];

const emoji = (c: string) =>
  c === 'quedas' ? '💧' : c === 'praia' ? '🏖️' : c === 'parque' ? '🦁' : c === 'historia' ? '🏛️' : c === 'cultura' ? '🎭' : c === 'montanha' ? '⛰️' : '📍';

export const ExploreScreen: React.FC<Props> = ({ navigation }) => {
  const [pontos, setPontos] = useState<PontoTuristico[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await tourismApi.pontos();
        setPontos(data);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtrados = filtro ? pontos.filter((p) => p.categoria === filtro) : pontos;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorar Angola</Text>
        <Text style={styles.headerSub}>Guia turístico das 18 províncias</Text>
      </View>

      <FlatList
        horizontal
        data={CATEGORIAS}
        keyExtractor={(i) => i.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, filtro === item.key && styles.chipActive]}
            onPress={() => setFiltro(item.key)}
          >
            <Text style={[styles.chipText, filtro === item.key && styles.chipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtrados}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Attraction', { slug: item.slug })}
          >
            <View style={styles.cardImg}>
              <Text style={{ fontSize: 40 }}>{emoji(item.categoria)}</Text>
              {item.destaque && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Destaque</Text>
                </View>
              )}
            </View>
            <View style={{ padding: 10 }}>
              <Text style={styles.cardNome} numberOfLines={1}>
                {item.nome}
              </Text>
              <Text style={styles.cardProv}>{item.provincia_nome}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ fontSize: 40 }}>🗺️</Text>
            <Text style={{ color: colors.gray500, marginTop: 8 }}>Nenhum ponto encontrado</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.gray50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: colors.green,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { color: colors.white, fontSize: 24, fontWeight: '900' },
  headerSub: { color: colors.gold, fontSize: 13, marginTop: 4, fontWeight: '600' },
  filters: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  chipActive: { backgroundColor: colors.green, borderColor: colors.green },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.gray600 },
  chipTextActive: { color: colors.white },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardImg: {
    height: 110,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: colors.black },
  cardNome: { fontWeight: '800', color: colors.gray900, fontSize: 14 },
  cardProv: { fontSize: 12, color: colors.gray500, marginTop: 2 },
});
