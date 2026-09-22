import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { tourismApi, Provincia, PontoTuristico } from '../services/api';
import { colors } from '../constants/theme';
import { Button } from '../components/Button';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [destaques, setDestaques] = useState<PontoTuristico[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, d] = await Promise.all([tourismApi.provincias(), tourismApi.destaques()]);
        if (cancelled) return;
        setProvincias(p);
        setDestaques(d);
        if (p[0]) {
          setOrigem((prev) => prev || p.find((x) => x.slug === 'luanda')?.slug || p[0].slug);
          setDestino((prev) => prev || p.find((x) => x.slug === 'huambo')?.slug || p[1]?.slug || '');
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const [p, d] = await Promise.all([tourismApi.provincias(), tourismApi.destaques()]);
      setProvincias(p);
      setDestaques(d);
    } catch {}
    setRefreshing(false);
  };

  const swap = () => {
    setOrigem(destino);
    setDestino(origem);
  };

  const search = () => {
    if (!origem || !destino || origem === destino) return;
    navigation.navigate('SearchResults', { origem, destino });
  };

  const nomeDe = (slug: string) => provincias.find((p) => p.slug === slug)?.nome ?? slug;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Olá{user?.first_name ? `, ${user.first_name}` : ''} 👋</Text>
          <Text style={styles.headerTitle}>Para onde vais hoje?</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.first_name?.[0] ?? user?.username?.[0] ?? 'D').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Card de pesquisa */}
      <View style={styles.searchCard}>
        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Origem</Text>
            <TouchableOpacity
              style={styles.select}
              onPress={() =>
                navigation.navigate('ProvincePicker', {
                  title: 'Escolher origem',
                  onSelect: setOrigem,
                })
              }
            >
              <Text style={styles.selectText}>{origem ? nomeDe(origem) : 'Selecionar'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.swapBtn} onPress={swap}>
            <Text style={{ fontSize: 18 }}>⇄</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Destino</Text>
            <TouchableOpacity
              style={styles.select}
              onPress={() =>
                navigation.navigate('ProvincePicker', {
                  title: 'Escolher destino',
                  onSelect: setDestino,
                })
              }
            >
              <Text style={styles.selectText}>{destino ? nomeDe(destino) : 'Selecionar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Button title="Pesquisar viagens  🔍" onPress={search} />
      </View>

      {/* Destaques de turismo */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Turismo em destaque</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.sectionLink}>Ver tudo</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
          {destaques.length === 0 ? (
            <ActivityIndicator color={colors.green} />
          ) : (
            destaques.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.destaqueCard}
                onPress={() => navigation.navigate('Attraction', { slug: p.slug })}
              >
                <View style={styles.destaqueImg}>
                  <Text style={styles.destaqueEmoji}>
                    {p.categoria === 'quedas' ? '💧' : p.categoria === 'praia' ? '🏖️' : p.categoria === 'parque' ? '🦁' : p.categoria === 'historia' ? '🏛️' : '⛰️'}
                  </Text>
                </View>
                <Text style={styles.destaqueNome} numberOfLines={1}>
                  {p.nome}
                </Text>
                <Text style={styles.destaqueProv}>{p.provincia_nome}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Rotas populares */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rotas populares</Text>
        {[
          ['luanda', 'huambo'],
          ['luanda', 'benguela'],
          ['luanda', 'huila'],
          ['luanda', 'malanje'],
        ].map(([o, d]) => (
          <TouchableOpacity
            key={`${o}-${d}`}
            style={styles.popularRow}
            onPress={() => navigation.navigate('SearchResults', { origem: o, destino: d })}
          >
            <View style={styles.popularIcon}>
              <Text>🚌</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.popularRoute}>
                {nomeDe(o)} → {nomeDe(d)}
              </Text>
              <Text style={styles.popularSub}>Partidas diárias</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.gray50 },
  header: {
    backgroundColor: colors.green,
    paddingTop: 56,
    paddingBottom: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  hello: { color: colors.gold, fontWeight: '700', fontSize: 14 },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: '900', marginTop: 4 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: '900', color: colors.black, fontSize: 18 },
  searchCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: -48,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: colors.gray500, marginBottom: 6 },
  select: {
    height: 46,
    backgroundColor: colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  selectText: { fontSize: 14, color: colors.gray900, fontWeight: '600' },
  swapBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.gray900, marginBottom: 12 },
  sectionLink: { color: colors.green, fontWeight: '700', fontSize: 13, marginBottom: 12 },
  destaqueCard: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  destaqueImg: {
    height: 90,
    borderRadius: 12,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  destaqueEmoji: { fontSize: 36 },
  destaqueNome: { fontWeight: '700', color: colors.gray900, fontSize: 13 },
  destaqueProv: { fontSize: 11, color: colors.gray500, marginTop: 2 },
  popularRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  popularIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularRoute: { fontWeight: '700', color: colors.gray900, fontSize: 14 },
  popularSub: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.gray400 },
});
