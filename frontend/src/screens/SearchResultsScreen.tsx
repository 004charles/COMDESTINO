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
import { routesApi, Rota, Horario } from '../services/api';
import { colors } from '../constants/theme';
import { RouteCard } from '../components/RouteCard';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchResults'>;

type Viagem = Horario & { rota: Rota };

export const SearchResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { origem, destino, data } = route.params;
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const rotas = await routesApi.busca(origem, destino, data);
        const detalhadas = await Promise.all(
          rotas.map((r) => routesApi.rota(r.id, data))
        );
        const lista: Viagem[] = detalhadas.flatMap((r) =>
          (r.horarios ?? []).map((h) => ({ ...h, rota: r }))
        );
        setViagens(lista);
        if (lista.length === 0) setError('Sem viagens encontradas para esta rota.');
      } catch {
        setError('Erro ao pesquisar rotas. Verifique a ligação.');
      } finally {
        setLoading(false);
      }
    })();
  }, [origem, destino, data]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={styles.loadingText}>A procurar viagens...</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>
            {origem.charAt(0).toUpperCase() + origem.slice(1)} →{' '}
            {destino.charAt(0).toUpperCase() + destino.slice(1)}
          </Text>
          <Text style={styles.headerSub}>
            {viagens.length} partida{viagens.length === 1 ? '' : 's'} · {data ?? 'hoje'}
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>🔍</Text>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={viagens}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <RouteCard
              origem={item.rota.origem_nome}
              destino={item.rota.destino_nome}
              empresa={item.rota.empresa_info?.nome}
              horaSaida={item.hora_saida}
              horaChegada={item.hora_chegada}
              preco={item.preco}
              assentos={item.lugares_disponiveis}
              onPress={() =>
                navigation.navigate('Seats', {
                  horarioId: item.id,
                  rotaId: item.rota.id,
                  origem: item.rota.origem_nome,
                  destino: item.rota.destino_nome,
                  empresa: item.rota.empresa_info?.nome ?? '',
                  horaSaida: item.hora_saida,
                  horaChegada: item.hora_chegada,
                  preco: item.preco,
                  data: data ?? new Date().toISOString().slice(0, 10),
                })
              }
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.gray50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: colors.gray500 },
  header: {
    backgroundColor: colors.green,
    paddingTop: 56,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: colors.white, fontSize: 24, marginTop: -4 },
  headerTitle: { color: colors.white, fontSize: 17, fontWeight: '800' },
  headerSub: { color: colors.gold, fontSize: 12, marginTop: 2 },
  emptyText: { color: colors.gray500, textAlign: 'center', marginTop: 12 },
});
