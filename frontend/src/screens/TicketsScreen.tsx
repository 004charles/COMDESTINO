import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  useFocusEffect,
  CompositeScreenProps,
} from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../navigation/types';
import { bookingsApi, Reserva } from '../services/api';
import { colors } from '../constants/theme';
import { TicketCard } from '../components/TicketCard';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Tickets'>,
  NativeStackScreenProps<RootStackParamList>
>;

const TABS = [
  { key: 'PROXIMOS', label: 'Próximos' },
  { key: 'USADOS', label: 'Usados' },
  { key: 'CANCELADOS', label: 'Cancelados' },
] as const;

export const TicketsScreen: React.FC<Props> = ({ navigation }) => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('PROXIMOS');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await bookingsApi.minhas();
      setReservas(data);
    } catch {}
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const filtradas = reservas.filter((r) => {
    if (tab === 'PROXIMOS') return r.status === 'PAGO' || r.status === 'PENDENTE';
    if (tab === 'USADOS') return r.bilhete?.status === 'USADO';
    return r.status === 'CANCELADO' || r.status === 'EXPIRADO';
  });

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>A Minha Bilheteira</Text>
        <Text style={styles.headerSub}>Bilhetes guardados offline</Text>
      </View>

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtradas}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={colors.green}
          />
        }
        renderItem={({ item }) => (
          <TicketCard
            origem={item.rota_resumo?.origem ?? ''}
            destino={item.rota_resumo?.destino ?? ''}
            empresa={item.rota_resumo?.empresa}
            data={item.data_viagem}
            hora={item.rota_resumo?.hora_saida}
            assentos={item.assentos.map((a) => a.numero).join(', ')}
            status={item.bilhete?.status ?? item.status}
            onPress={() => navigation.navigate('TicketDetail', { reservaId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 52 }}>🎫</Text>
            <Text style={styles.emptyTitle}>Sem bilhetes {tab === 'PROXIMOS' ? 'ainda' : ''}</Text>
            <Text style={styles.emptySub}>
              {tab === 'PROXIMOS'
                ? 'As suas próximas viagens aparecem aqui.'
                : 'Nada por aqui.'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.gray50 },
  header: {
    backgroundColor: colors.green,
    paddingTop: 56,
    paddingBottom: 18,
    paddingHorizontal: 20,
  },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: '900' },
  headerSub: { color: colors.gold, fontSize: 13, marginTop: 4, fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: -12,
    borderRadius: 14,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.green },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.gray500 },
  tabTextActive: { color: colors.white },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.gray900, marginTop: 12 },
  emptySub: { fontSize: 13, color: colors.gray500, marginTop: 4 },
});
