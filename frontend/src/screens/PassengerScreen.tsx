import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { bookingsApi } from '../services/api';
import { colors, formatKz } from '../constants/theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Passenger'>;

type Passageiro = {
  numero: string;
  passageiro_nome: string;
  passageiro_telefone: string;
  passageiro_documento: string;
};

export const PassengerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { horarioId, origem, destino, empresa, horaSaida, data, preco, assentos } =
    route.params;
  const { user } = useAuth();
  const nomeDefault = [user?.first_name, user?.last_name].filter(Boolean).join(' ');

  const [passageiros, setPassageiros] = useState<Passageiro[]>(
    assentos.map((n) => ({
      numero: n,
      passageiro_nome: nomeDefault,
      passageiro_telefone: user?.phone ?? '',
      passageiro_documento: '',
    }))
  );
  const [loading, setLoading] = useState(false);
  const [metodo, setMetodo] = useState<'MCX' | 'BALCAO'>('MCX');
  const [mcxPhone, setMcxPhone] = useState(user?.phone ?? '+244');

  const total = parseFloat(preco) * assentos.length;

  const update = (idx: number, field: keyof Passageiro, value: string) => {
    setPassageiros((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = async () => {
    if (passageiros.some((p) => !p.passageiro_nome.trim())) {
      Alert.alert('Atenção', 'Preencha o nome de todos os passageiros.');
      return;
    }
    if (metodo === 'MCX' && mcxPhone.trim().length < 9) {
      Alert.alert('Atenção', 'Informe o número Multicaixa Express válido.');
      return;
    }
    setLoading(true);
    try {
      const reserva = await bookingsApi.criar({
        horario: horarioId,
        data_viagem: data,
        metodo_pagamento: metodo,
        assentos: passageiros,
      });
      navigation.navigate('Payment', {
        reservaId: reserva.id,
        total: reserva.preco_total,
        metodo,
        mcxPhone,
        origem,
        destino,
        empresa,
        horaSaida,
        data,
        assentos: assentos.join(', '),
      });
    } catch (e: any) {
      const msg = e?.response?.data;
      const text =
        typeof msg === 'object' && msg
          ? Object.values(msg).flat().join('\n')
          : 'Erro ao criar reserva.';
      Alert.alert('Erro', text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>
          {origem} → {destino}
        </Text>
        <Text style={styles.summarySub}>
          {empresa} · {data} · {horaSaida.slice(0, 5)}
        </Text>
        <Text style={styles.summarySeats}>Assentos: {assentos.join(', ')}</Text>
      </View>

      <Text style={styles.sectionTitle}>Dados do passageiro</Text>
      {passageiros.map((p, idx) => (
        <View key={p.numero} style={styles.paxCard}>
          <View style={styles.paxHeader}>
            <View style={styles.seatBadge}>
              <Text style={styles.seatBadgeText}>{p.numero}</Text>
            </View>
            <Text style={styles.paxTitle}>Passageiro {idx + 1}</Text>
            <TouchableOpacity
              onPress={() =>
                setPassageiros((prev) =>
                  prev.map((x, i) =>
                    i === idx
                      ? {
                          ...x,
                          passageiro_nome: nomeDefault,
                          passageiro_telefone: user?.phone ?? '',
                        }
                      : x
                  )
                )
              }
            >
              <Text style={styles.fillMe}>Sou eu</Text>
            </TouchableOpacity>
          </View>
          <Input
            label="Nome completo *"
            value={p.passageiro_nome}
            onChangeText={(v) => update(idx, 'passageiro_nome', v)}
            placeholder="Nome como no BI"
          />
          <Input
            label="Telefone"
            value={p.passageiro_telefone}
            onChangeText={(v) => update(idx, 'passageiro_telefone', v)}
            placeholder="+244 9XX XXX XXX"
            keyboardType="phone-pad"
          />
          <Input
            label="BI / Passaporte (opcional)"
            value={p.passageiro_documento}
            onChangeText={(v) => update(idx, 'passageiro_documento', v)}
            placeholder="003456789LA041"
          />
        </View>
      ))}

      <Text style={styles.sectionTitle}>Método de pagamento</Text>
      <TouchableOpacity
        style={[styles.payOption, metodo === 'MCX' && styles.payActive]}
        onPress={() => setMetodo('MCX')}
      >
        <View style={styles.radio}>{metodo === 'MCX' && <View style={styles.radioDot} />}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.payTitle}>Multicaixa Express</Text>
          <Text style={styles.paySub}>Confirmação imediata no telemóvel</Text>
        </View>
        <Text style={{ fontSize: 22 }}>📱</Text>
      </TouchableOpacity>
      {metodo === 'MCX' && (
        <Input
          label="Número Multicaixa Express"
          value={mcxPhone}
          onChangeText={setMcxPhone}
          placeholder="+244 9XX XXX XXX"
          keyboardType="phone-pad"
          containerStyle={{ marginTop: 4 }}
        />
      )}
      <TouchableOpacity
        style={[styles.payOption, metodo === 'BALCAO' && styles.payActive]}
        onPress={() => setMetodo('BALCAO')}
      >
        <View style={styles.radio}>{metodo === 'BALCAO' && <View style={styles.radioDot} />}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.payTitle}>Pagar na bilheteira</Text>
          <Text style={styles.paySub}>Reserva PENDENTE · pague no dia da viagem</Text>
        </View>
        <Text style={{ fontSize: 22 }}>🎫</Text>
      </TouchableOpacity>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total a pagar</Text>
        <Text style={styles.totalValue}>{formatKz(String(total))}</Text>
      </View>

      <Button
        title={metodo === 'MCX' ? `Pagar ${formatKz(String(total))}` : 'Confirmar reserva'}
        onPress={handleSubmit}
        loading={loading}
        variant={metodo === 'MCX' ? 'primary' : 'gold'}
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.gray50 },
  summary: {
    backgroundColor: colors.green,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: { color: colors.white, fontWeight: '900', fontSize: 17 },
  summarySub: { color: colors.gold, fontSize: 13, marginTop: 4, fontWeight: '600' },
  summarySeats: { color: colors.white, fontSize: 13, marginTop: 6, opacity: 0.9 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.gray900,
    marginBottom: 10,
    marginTop: 6,
  },
  paxCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  paxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  seatBadge: {
    backgroundColor: colors.green,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  seatBadgeText: { color: colors.white, fontWeight: '800', fontSize: 13 },
  paxTitle: { flex: 1, fontWeight: '700', color: colors.gray700 },
  fillMe: { color: colors.green, fontWeight: '700', fontSize: 13 },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.gray200,
  },
  payActive: { borderColor: colors.green, backgroundColor: colors.greenLight },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
  },
  payTitle: { fontWeight: '700', color: colors.gray900, fontSize: 14 },
  paySub: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  totalLabel: { fontSize: 15, color: colors.gray700, fontWeight: '600' },
  totalValue: { fontSize: 22, fontWeight: '900', color: colors.green },
});
