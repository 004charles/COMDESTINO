import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    phone: '+244',
    email: '',
    password: '',
    password2: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.first_name || !form.username || !form.phone || !form.password) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios.');
      return;
    }
    if (form.password !== form.password2) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
    } catch (e: any) {
      const msg = e?.response?.data;
      const text =
        typeof msg === 'object' && msg
          ? Object.entries(msg)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join('\n')
          : 'Não foi possível criar a conta.';
      Alert.alert('Erro no registo', text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Junta-te à maior rede de autocarros de Angola</Text>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input label="Nome *" placeholder="Maria" value={form.first_name} onChangeText={set('first_name')} />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Sobrenome" placeholder="Santos" value={form.last_name} onChangeText={set('last_name')} />
          </View>
        </View>

        <Input
          label="Utilizador *"
          placeholder="maria.santos"
          autoCapitalize="none"
          value={form.username}
          onChangeText={set('username')}
        />
        <Input
          label="Telefone *"
          placeholder="+244 9XX XXX XXX"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={set('phone')}
        />
        <Input
          label="E-mail"
          placeholder="maria@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.email}
          onChangeText={set('email')}
        />
        <Input label="Senha *" placeholder="Mínimo 8 caracteres" secureTextEntry value={form.password} onChangeText={set('password')} />
        <Input label="Confirmar senha *" secureTextEntry value={form.password2} onChangeText={set('password2')} />

        <Button title="Criar conta" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />
        <Button
          title="Já tenho conta"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 12 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  container: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '900', color: colors.gray900, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.gray500, marginBottom: 24 },
  row: { flexDirection: 'row' },
});
