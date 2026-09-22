import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { bookingsApi, Reserva } from '../services/api';
import { colors } from '../constants/theme';
import { Button } from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Success'>;

export const SuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const { reservaId } = route.params;
  const [reserva, setReserva] = useState<Reserva | null>(null);

  useEffect(() => {
    bookingsApi.get(reservaId).then(setReserva).catch(() => {});
  }, [reservaId]);

  return (
    <View style={styles.flex}>
      <View style={styles.center}>
        <View style={styles.checkCircle}>
          <Text style={{ fontSize: 52 }}>✓</Text>
        </View>
        <Text style={styles.title}>Reserva confirmada!</Text>
        <Text style={styles.sub}>
          {reserva?.rota_resumo?.origem} → {reserva?.rota_resumo?.destino}
        </Text>
        <Text style={styles.subSmall}>
          {reserva?.rota_resumo?.empresa} · {reserva?.data_viagem} ·{' '}
          {reserva?.rota_resumo?.hora_saida?.slice(0, 5)}
        </Text>
        <Text style={styles.seats}>
          Assentos: {reserva?.assentos.map((a) => a.numero).join(', ')}
        </Text>
        {reserva?.status === 'PENDENTE' && (
          <View style={styles.pendente}>
            <Text style={styles.pendenteText}>
              Pagamento na bilheteira — chegue com antecedência!
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title="Ver bilhete"
          onPress={() => navigation.replace('TicketDetail', { reservaId })}
        />
        <Button
          title="Voltar ao início"
          variant="outline"
          onPress={() => navigation.navigate('MainTabs')}
          style={{ marginTop: 12 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white, padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.greenLight,
    borderWidth: 3,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: '900', color: colors.gray900 },
  sub: { fontSize: 16, color: colors.gray700, marginTop: 10, fontWeight: '600' },
  subSmall: { fontSize: 13, color: colors.gray500, marginTop: 4 },
  seats: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '800',
    color: colors.green,
  },
  pendente: {
    marginTop: 16,
    backgroundColor: colors.goldLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  pendenteText: { color: colors.gray700, fontSize: 13, fontWeight: '600' },
  actions: { paddingBottom: 24 },
});
