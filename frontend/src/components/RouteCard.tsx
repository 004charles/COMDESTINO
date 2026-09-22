import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, formatKz } from '../constants/theme';
import { Button } from './Button';

type Props = {
  origem: string;
  destino: string;
  empresa?: string;
  horaSaida: string;
  horaChegada: string;
  preco: string;
  assentos?: number | null;
  onPress: () => void;
  ctaLabel?: string;
};

export const RouteCard: React.FC<Props> = ({
  origem,
  destino,
  empresa,
  horaSaida,
  horaChegada,
  preco,
  assentos,
  onPress,
  ctaLabel = 'Escolher',
}) => (
  <View style={styles.card}>
    <View style={styles.topRow}>
      <Text style={styles.empresa}>{empresa ?? 'Autocarro'}</Text>
      {assentos != null && (
        <Text style={[styles.assentos, assentos < 10 && { color: colors.error }]}>
          {assentos} lugares
        </Text>
      )}
    </View>
    <View style={styles.timesRow}>
      <View style={styles.timeCol}>
        <Text style={styles.time}>{horaSaida.slice(0, 5)}</Text>
        <Text style={styles.city}>{origem}</Text>
      </View>
      <View style={styles.line}>
        <View style={styles.dot} />
        <View style={styles.dashed} />
        <View style={[styles.dot, { backgroundColor: colors.gold }]} />
      </View>
      <View style={[styles.timeCol, { alignItems: 'flex-end' }]}>
        <Text style={styles.time}>{horaChegada.slice(0, 5)}</Text>
        <Text style={styles.city}>{destino}</Text>
      </View>
    </View>
    <View style={styles.bottomRow}>
      <Text style={styles.preco}>{formatKz(preco)}</Text>
      <Button title={ctaLabel} onPress={onPress} style={{ height: 42, paddingHorizontal: 24 }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  empresa: { fontWeight: '700', color: colors.gray700, fontSize: 14 },
  assentos: { fontSize: 12, color: colors.green, fontWeight: '600' },
  timesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  timeCol: { flex: 1 },
  time: { fontSize: 20, fontWeight: '800', color: colors.gray900 },
  city: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  line: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  dashed: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.gray200,
    marginHorizontal: 4,
    borderRadius: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preco: { fontSize: 17, fontWeight: '800', color: colors.green },
});
