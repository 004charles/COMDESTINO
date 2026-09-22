import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { bookingsApi } from '../services/api';
import { colors, formatKz } from '../constants/theme';
import { Button } from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

type Fase = 'idle' | 'processando' | 'sucesso' | 'erro';

export const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const {
    reservaId,
    total,
    metodo,
    mcxPhone,
    origem,
    destino,
    empresa,
    horaSaida,
    data,
    assentos,
  } = route.params;
  const [fase, setFase] = useState<Fase>(metodo === 'BALCAO' ? 'idle' : 'idle');

  const pagar = async () => {
    if (metodo === 'BALCAO') {
      navigation.navigate('Success', { reservaId });
      return;
    }
    setFase('processando');
    try {
      // Simulação MCX: o backend confirma e emite o bilhete
      await bookingsApi.pagar(reservaId, `MCX${Date.now()}`);
      setFase('sucesso');
      setTimeout(() => navigation.navigate('Success', { reservaId }), 1200);
    } catch (e: any) {
      setFase('erro');
      Alert.alert('Pagamento falhou', e?.response?.data?.detail ?? 'Tente novamente.');
    }
  };

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <View style={styles.body}>
        {/* Resumo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo da viagem</Text>
          <Row label="Rota" value={`${origem} → ${destino}`} />
          <Row label="Empresa" value={empresa} />
          <Row label="Data" value={data} />
          <Row label="Saída" value={horaSaida.slice(0, 5)} />
          <Row label="Assentos" value={assentos} />
          <View style={styles.divider} />
          <Row label="Total" value={formatKz(total)} highlight />
        </View>

        {/* Multicaixa */}
        {metodo === 'MCX' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Multicaixa Express</Text>
            <Text style={styles.mcxHint}>
              Vai receber uma chamada/SMS de confirmação no número:
            </Text>
            <Text style={styles.mcxPhone}>{mcxPhone}</Text>

            {fase === 'idle' && (
              <Button title={`Pagar ${formatKz(total)}`} onPress={pagar} style={{ marginTop: 16 }} />
            )}

            {fase === 'processando' && (
              <View style={styles.processing}>
                <ActivityIndicator size="large" color={colors.green} />
                <Text style={styles.processingText}>A aguardar confirmação MCX...</Text>
                <Text style={styles.processingSub}>Confirme no seu telemóvel</Text>
              </View>
            )}

            {fase === 'sucesso' && (
              <View style={styles.success}>
                <Text style={{ fontSize: 56 }}>✅</Text>
                <Text style={styles.successText}>Pagamento confirmado!</Text>
                <Text style={styles.successSub}>A gerar o seu bilhete...</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pagamento na bilheteira</Text>
            <Text style={styles.mcxHint}>
              Chegue com antecedência e pague {formatKz(total)} na bilheteira antes da partida.
            </Text>
            <Button
              title="Confirmar reserva"
              variant="gold"
              onPress={pagar}
              style={{ marginTop: 16 }}
            />
          </View>
        )}

        {fase === 'erro' && (
          <Button title="Tentar novamente" onPress={pagar} style={{ marginTop: 12 }} />
        )}
      </View>
    </View>
  );
};

const Row = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, highlight && { color: colors.green, fontSize: 18, fontWeight: '900' }]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.gray50 },
  header: {
    backgroundColor: colors.green,
    paddingTop: 56,
    paddingBottom: 18,
    paddingHorizontal: 20,
  },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: '900' },
  body: { padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.gray900,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: { color: colors.gray500, fontSize: 13 },
  rowValue: { color: colors.gray900, fontSize: 13, fontWeight: '700' },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: 8,
  },
  mcxHint: { color: colors.gray500, fontSize: 13, lineHeight: 19 },
  mcxPhone: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.green,
    marginTop: 8,
  },
  processing: { alignItems: 'center', paddingVertical: 20 },
  processingText: { marginTop: 12, fontWeight: '700', color: colors.gray900 },
  processingSub: { marginTop: 4, fontSize: 12, color: colors.gray500 },
  success: { alignItems: 'center', paddingVertical: 20 },
  successText: { marginTop: 8, fontSize: 18, fontWeight: '900', color: colors.green },
  successSub: { marginTop: 4, fontSize: 13, color: colors.gray500 },
});
