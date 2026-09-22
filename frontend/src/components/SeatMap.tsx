import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, formatKz } from '../constants/theme';
import { Button } from './Button';

type Props = {
  totalAssentos: number;
  ocupados: string[];
  onContinue: (selected: string[]) => void;
  preco: string;
};

// Layout 2+2 com corredor: 4 colunas — A B | C D
const COLS = ['A', 'B', '', 'C', 'D'];

export const SeatMap: React.FC<Props> = ({ totalAssentos, ocupados, onContinue, preco }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const rows = Math.ceil(totalAssentos / 4);

  const toggle = (seat: string) => {
    if (ocupados.includes(seat)) return;
    setSelected((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const isOccupied = (seat: string) => ocupados.includes(seat);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.legend}>
        <LegendDot bg={colors.white} border={colors.gray200} label="Livre" />
        <LegendDot bg={colors.green} label="Selecionado" />
        <LegendDot bg={colors.gray200} label="Ocupado" />
      </View>

      <View style={styles.bus}>
        <View style={styles.driverRow}>
          <View style={styles.wheel} />
          <Text style={styles.driverLabel}>Condutores</Text>
        </View>

        <View style={styles.grid}>
          {Array.from({ length: rows }).map((_, r) => (
            <View key={r} style={styles.row}>
              {COLS.map((col, c) => {
                if (col === '') return <View key={c} style={styles.aisle} />;
                const seatIndex = r * 4 + (c < 2 ? c : c - 1) + 1;
                const seat = `${r + 1}${COLS[c]}`;
                if (seatIndex > totalAssentos) return <View key={c} style={styles.seat} />;
                const occupied = isOccupied(seat);
                const sel = selected.includes(seat);
                return (
                  <TouchableOpacity
                    key={c}
                    activeOpacity={0.7}
                    onPress={() => toggle(seat)}
                    style={[
                      styles.seat,
                      occupied && { backgroundColor: colors.gray200, borderColor: colors.gray200 },
                      sel && { backgroundColor: colors.green, borderColor: colors.green },
                    ]}
                    disabled={occupied}
                  >
                    <Text
                      style={[
                        styles.seatText,
                        occupied && { color: colors.gray400 },
                        sel && { color: colors.white, fontWeight: '800' },
                      ]}
                    >
                      {seat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>
            {selected.length} assento{selected.length === 1 ? '' : 's'}
          </Text>
          <Text style={styles.footerPrice}>
            {formatKz(String(parseFloat(preco || '0') * selected.length))}
          </Text>
        </View>
        <Button
          title="Continuar"
          disabled={selected.length === 0}
          onPress={() => onContinue(selected)}
          style={{ flex: 1, marginLeft: 16 }}
        />
      </View>
    </View>
  );
};

const LegendDot = ({ bg, border, label }: { bg: string; border?: string; label: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: bg, borderColor: border ?? bg }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 16,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 14, borderRadius: 4, borderWidth: 1 },
  legendText: { fontSize: 12, color: colors.gray500 },
  bus: {
    backgroundColor: colors.gray50,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  wheel: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: colors.gray400,
  },
  driverLabel: { fontSize: 12, color: colors.gray500, fontWeight: '600' },
  grid: { alignItems: 'center' },
  row: { flexDirection: 'row', marginBottom: 8, gap: 8 },
  aisle: { width: 22 },
  seat: {
    width: 54,
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatText: { fontSize: 13, fontWeight: '600', color: colors.gray700 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  footerLabel: { fontSize: 12, color: colors.gray500 },
  footerPrice: { fontSize: 20, fontWeight: '800', color: colors.green },
});
