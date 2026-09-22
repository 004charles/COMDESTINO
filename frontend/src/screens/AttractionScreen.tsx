import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { tourismApi, PontoTuristico } from '../services/api';
import { colors, formatKz } from '../constants/theme';
import { Button } from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Attraction'>;

const emoji = (c: string) =>
  c === 'quedas' ? '💧' : c === 'praia' ? '🏖️' : c === 'parque' ? '🦁' : c === 'historia' ? '🏛️' : c === 'cultura' ? '🎭' : c === 'montanha' ? '⛰️' : '📍';

export const AttractionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { slug } = route.params;
  const [ponto, setPonto] = useState<PontoTuristico | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setPonto(await tourismApi.ponto(slug));
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading || !ponto) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  const provinciaSlug = (ponto as any).provincia_nome
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-');

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.hero}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.heroEmoji}>{emoji(ponto.categoria)}</Text>
          <View style={styles.categoriaBadge}>
            <Text style={styles.categoriaText}>{ponto.categoria}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.nome}>{ponto.nome}</Text>
          <Text style={styles.provincia}>📍 {ponto.provincia_nome}</Text>

          {ponto.descricao ? <Text style={styles.desc}>{ponto.descricao}</Text> : null}

          <View style={styles.infoGrid}>
            {ponto.endereco ? (
              <InfoItem label="Localização" value={ponto.endereco} />
            ) : null}
            {ponto.horario ? <InfoItem label="Horário" value={ponto.horario} /> : null}
            <InfoItem
              label="Entrada"
              value={
                Number(ponto.preco_entrada) > 0
                  ? formatKz(ponto.preco_entrada)
                  : 'Gratuito'
              }
            />
          </View>

          <View style={styles.routesBox}>
            <Text style={styles.routesTitle}>Como chegar de autocarro</Text>
            <Text style={styles.routesSub}>
              Encontre viagens para {ponto.provincia_nome} e viaja com o Destino.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <Button
          title="Ir para o Destino  🚌"
          variant="gold"
          onPress={() =>
            navigation.navigate('SearchResults', {
              origem: 'luanda',
              destino: provinciaSlug ?? '',
            })
          }
        />
      </View>
    </View>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: {
    height: 220,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  back: {
    position: 'absolute',
    top: 52,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: colors.white, fontSize: 26, marginTop: -4 },
  heroEmoji: { fontSize: 80 },
  categoriaBadge: {
    position: 'absolute',
    bottom: 16,
    backgroundColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoriaText: { fontWeight: '800', fontSize: 12, color: colors.black },
  body: { padding: 20 },
  nome: { fontSize: 24, fontWeight: '900', color: colors.gray900 },
  provincia: { fontSize: 14, color: colors.green, fontWeight: '700', marginTop: 6 },
  desc: { fontSize: 15, color: colors.gray700, lineHeight: 23, marginTop: 14 },
  infoGrid: { marginTop: 20, gap: 10 },
  infoItem: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: { color: colors.gray500, fontWeight: '600', fontSize: 13 },
  infoValue: { color: colors.gray900, fontWeight: '700', fontSize: 13 },
  routesBox: {
    marginTop: 20,
    backgroundColor: colors.greenLight,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.green,
  },
  routesTitle: { fontWeight: '800', color: colors.greenDark, fontSize: 15 },
  routesSub: { color: colors.gray700, marginTop: 6, fontSize: 13, lineHeight: 19 },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 28,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
});
