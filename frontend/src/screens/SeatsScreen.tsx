import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { routesApi } from '../services/api';
import { colors, formatKz } from '../constants/theme';
import { SeatMap } from '../components/SeatMap';

type Props = NativeStackScreenProps<RootStackParamList, 'Seats'>;

export const SeatsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { horarioId, origem, destino, empresa, horaSaida, horaChegada, preco, data } =
    route.params;
  const [total, setTotal] = useState(44);
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const info = await routesApi.assentos(horarioId, data);
        setTotal(info.total_assentos);
        setOcupados(info.ocupados);
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar os assentos.');
      } finally {
        setLoading(false);
      }
    })();
  }, [horarioId, data]);

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {origem} → {destino}
          </Text>
          <Text style={styles.headerSub}>
            {empresa} · {data} · {horaSaida.slice(0, 5)}–{horaChegada.slice(0, 5)} · {formatKz(preco)}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.green} />
          <Text style={{ color: colors.gray500, marginTop: 10 }}>A carregar assentos...</Text>
        </View>
      ) : (
        <View style={styles.body}>
          <SeatMap
            totalAssentos={total}
            ocupados={ocupados}
            preco={preco}
            onContinue={(selected) =>
              navigation.navigate('Passenger', {
                horarioId,
                origem,
                destino,
                empresa,
                horaSaida,
                data,
                preco,
                assentos: selected,
              })
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: colors.green,
    paddingTop: 56,
    paddingBottom: 16,
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
  headerTitle: { color: colors.white, fontSize: 16, fontWeight: '800' },
  headerSub: { color: colors.gold, fontSize: 11, marginTop: 2 },
  body: { flex: 1, padding: 16 },
});
