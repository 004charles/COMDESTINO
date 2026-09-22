import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Share,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { bookingsApi, Reserva } from '../services/api';
import { colors, formatKz } from '../constants/theme';
import { Button } from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketDetail'>;

export const TicketDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { reservaId } = route.params;
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setReserva(await bookingsApi.get(reservaId));
      } finally {
        setLoading(false);
      }
    })();
  }, [reservaId]);

  if (loading || !reserva) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  const codigo = reserva.bilhete?.codigo ?? reserva.id;
  const r = reserva.rota_resumo;

  const share = async () => {
    await Share.share({
      message: `Bilhete Destino 🚌\n${r?.origem} → ${r?.destino}\n${reserva.data_viagem} · ${r?.hora_saida?.slice(0, 5)}\nAssentos: ${reserva.assentos.map((a) => a.numero).join(', ')}\nCódigo: ${codigo}`,
    });
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.ticket}>
        {/* Cabeçalho */}
        <View style={styles.ticketHeader}>
          <Text style={styles.brand}>DESTINO</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  reserva.bilhete?.status === 'ATIVO' || reserva.status === 'PAGO'
                    ? colors.gold
                    : colors.gray200,
              },
            ]}
          >
            <Text style={styles.statusText}>
              {reserva.bilhete?.status ?? reserva.status}
            </Text>
          </View>
        </View>

        {/* Rota */}
        <View style={styles.routeRow}>
          <View style={styles.routeCol}>
            <Text style={styles.routeTime}>{r?.hora_saida?.slice(0, 5) ?? '--:--'}</Text>
            <Text style={styles.routeCity}>{r?.origem}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={[styles.routeCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.routeTime}>{r?.hora_chegada?.slice(0, 5) ?? '--:--'}</Text>
            <Text style={styles.routeCity}>{r?.destino}</Text>
          </View>
        </View>

        {/* Detalhes */}
        <View style={styles.details}>
          <Detail label="Empresa" value={r?.empresa ?? '—'} />
          <Detail label="Data" value={reserva.data_viagem} />
          <Detail label="Assentos" value={reserva.assentos.map((a) => a.numero).join(', ')} />
          <Detail label="Passageiro" value={reserva.assentos[0]?.passageiro_nome ?? '—'} />
          <Detail label="Pagamento" value={reserva.metodo_pagamento} />
          <Detail label="Valor" value={formatKz(reserva.preco_total)} />
          <Detail label="Código" value={String(codigo).slice(0, 18)} />
        </View>

        {/* Perfuração */}
        <View style={styles.perforation}>
          <View style={styles.cutCircle} />
          <View style={styles.cutLine} />
          <View style={[styles.cutCircle, { right: -10 }]} />
        </View>

        {/* QR */}
        <View style={styles.qrBox}>
          <QRCode
            value={String(codigo)}
            size={180}
            backgroundColor={colors.white}
            color={colors.black}
          />
          <Text style={styles.qrHint}>Apresente este QR ao motorista</Text>
        </View>
      </View>

      <Button title="Partilhar bilhete" variant="outline" onPress={share} style={{ marginTop: 16 }} />
      <Button
        title="Voltar"
        onPress={() => navigation.goBack()}
        style={{ marginTop: 10 }}
      />
    </ScrollView>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.gray50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ticket: {
    backgroundColor: colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  ticketHeader: {
    backgroundColor: colors.green,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  brand: { color: colors.white, fontWeight: '900', fontSize: 18, letterSpacing: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: '900', color: colors.black },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  routeCol: { flex: 1 },
  routeTime: { fontSize: 26, fontWeight: '900', color: colors.gray900 },
  routeCity: { fontSize: 13, color: colors.gray500, marginTop: 2 },
  arrow: { fontSize: 22, color: colors.gold, fontWeight: '900' },
  details: { paddingHorizontal: 20, paddingBottom: 16 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  detailLabel: { color: colors.gray500, fontSize: 13 },
  detailValue: { color: colors.gray900, fontSize: 13, fontWeight: '700' },
  perforation: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
  },
  cutCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gray50,
    marginLeft: -10,
  },
  cutLine: {
    flex: 1,
    height: 1.5,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    borderTopWidth: 1.5,
    borderTopColor: colors.gray300,
  },
  qrBox: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
  },
  qrHint: { marginTop: 12, fontSize: 12, color: colors.gray500 },
});
