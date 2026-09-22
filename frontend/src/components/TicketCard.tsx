import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/theme';

type Props = {
  origem: string;
  destino: string;
  empresa?: string;
  data: string;
  hora?: string;
  assentos: string;
  status: string;
  onPress?: () => void;
};

const statusColor = (s: string) => {
  if (s === 'PAGO' || s === 'ATIVO') return colors.green;
  if (s === 'PENDENTE') return colors.warning;
  return colors.gray400;
};

export const TicketCard: React.FC<Props> = ({
  origem,
  destino,
  empresa,
  data,
  hora,
  assentos,
  status,
  onPress,
}) => (
  <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.rota}>
        {origem} <Text style={{ color: colors.gold }}>→</Text> {destino}
      </Text>
      <View style={[styles.badge, { backgroundColor: statusColor(status) + '22' }]}>
        <Text style={[styles.badgeText, { color: statusColor(status) }]}>{status}</Text>
      </View>
    </View>
    <Text style={styles.meta}>
      {empresa ? `${empresa} · ` : ''}
      {data}
      {hora ? ` · ${hora.slice(0, 5)}` : ''}
    </Text>
    <View style={styles.footer}>
      <Text style={styles.assentos}>Assentos: {assentos}</Text>
      <Text style={styles.ver}>Ver bilhete ›</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.green,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rota: { fontSize: 16, fontWeight: '800', color: colors.gray900 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  meta: { marginTop: 6, fontSize: 13, color: colors.gray500 },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assentos: { fontSize: 13, fontWeight: '600', color: colors.gray700 },
  ver: { fontSize: 13, fontWeight: '700', color: colors.green },
});
