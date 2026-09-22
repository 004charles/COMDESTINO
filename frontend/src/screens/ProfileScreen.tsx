import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('Terminar sessão', 'Deseja mesmo sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.first_name?.[0] ?? user?.username?.[0] ?? 'D').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>
          {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username}
        </Text>
        <Text style={styles.contact}>
          {user?.phone || user?.email || `@${user?.username}`}
        </Text>
      </View>

      <View style={styles.menu}>
        <MenuItem icon="👤" label="Dados pessoais" />
        <MenuItem icon="🎫" label="Histórico de viagens" onPress={() => navigation.navigate('Tickets')} />
        <MenuItem icon="🔔" label="Notificações" />
        <MenuItem icon="🌐" label="Idioma: Português (AO)" />
        <MenuItem icon="📞" label="Ajuda e contactos" />
      </View>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Terminar sessão</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Destino MVP · v1.0.0</Text>
    </View>
  );
};

const MenuItem = ({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
    <Text style={{ fontSize: 18 }}>{icon}</Text>
    <Text style={styles.itemLabel}>{label}</Text>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.gray50 },
  header: {
    backgroundColor: colors.green,
    paddingTop: 60,
    paddingBottom: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 30, fontWeight: '900', color: colors.black },
  name: { color: colors.white, fontSize: 20, fontWeight: '900', marginTop: 12 },
  contact: { color: colors.gold, fontSize: 13, marginTop: 4, fontWeight: '600' },
  menu: { padding: 16, gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
  },
  itemLabel: { flex: 1, fontWeight: '600', color: colors.gray900, fontSize: 14 },
  chevron: { fontSize: 22, color: colors.gray400 },
  logout: {
    marginHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: { color: colors.error, fontWeight: '800', fontSize: 15 },
  version: {
    textAlign: 'center',
    color: colors.gray400,
    fontSize: 12,
    marginTop: 16,
  },
});
