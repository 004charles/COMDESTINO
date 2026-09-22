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
    if (!form.first_name.trim() || !form.username.trim() || !form.password) {
      Alert.alert('Atenção', 'Preencha nome, utilizador e senha.');
      return;
    }
    if (form.username.trim().length < 3) {
      Alert.alert('Atenção', 'O utilizador deve ter pelo menos 3 caracteres.');
      return;
    }
    if (form.password.length < 8) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (form.password !== form.password2) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    const digits = form.phone.replace(/\D/g, '');
    if (digits && digits.length < 9) {
      Alert.alert('Atenção', 'Telefone inválido. Ex: +244 923 000 000');
      return;
    }
    setLoading(true);
    try {
      await register({
        ...form,
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        phone: digits.length >= 9 ? form.phone : '',
      });
    } catch (e: any) {
      if (!e?.response) {
        Alert.alert(
          'Sem ligação',
          'Não foi possível contactar o servidor. Verifique se o backend está a correr e se o IP está correto.'
        );
      } else {
        const msg = e.response.data;
        let text: string;
        if (typeof msg === 'object' && msg) {
          const map: Record<string, string> = {
            username: 'Utilizador',
            phone: 'Telefone',
            password: 'Senha',
            password2: 'Confirmar senha',
            email: 'E-mail',
            first_name: 'Nome',
            detail: '',
          };
          text = Object.entries(msg)
            .map(([k, v]) => {
              const label = map[k] ?? k;
              const val = Array.isArray(v) ? v.join(', ') : String(v);
              const translated = val
                .replace('This password is too short. It must contain at least 8 characters.', 'Mínimo 8 caracteres.')
                .replace('Esta palavra-passe é muito comum.', 'Esta senha é muito comum.')
                .replace('Esta palavra-passe é inteiramente numérica.', 'A senha não pode ser só números.')
                .replace('A password é demasiado semelhante com os dados pessoais.', 'A senha parece-se demasiado com os seus dados.')
                .replace('Já existe um utilizador com esse nome.', 'Já existe este utilizador.')
                .replace('utilizador com este telefone já existe.', 'Este telefone já está registado.');
              return label ? `${label}: ${translated}` : translated;
            })
            .join('\n');
        } else {
          text = 'Não foi possível criar a conta. Tente novamente.';
        }
        Alert.alert('Erro no registo', text);
      }
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
          label="Telefone"
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
        <Text style={styles.hint}>A senha deve ter 8+ caracteres, letras e números.</Text>

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
  hint: { fontSize: 12, color: colors.gray500, marginTop: -6, marginBottom: 12 },
});
