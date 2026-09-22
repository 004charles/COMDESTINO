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

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      await signIn(username.trim(), password);
    } catch {
      Alert.alert('Erro', 'Credenciais inválidas. Tente novamente.');
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
        <View style={styles.logoBox}>
          <Text style={styles.logo}>Destino</Text>
          <Text style={styles.tagline}>Viaja por Angola · Bilhetes & Turismo</Text>
        </View>

        <Text style={styles.title}>Bem-vindo de volta</Text>

        <Input
          label="Telefone, e-mail ou utilizador"
          placeholder="+244 9XX XXX XXX"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <Input
          label="Senha"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button title="Entrar" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />

        <Button
          title="Criar conta"
          variant="outline"
          onPress={() => navigation.navigate('Register')}
          style={{ marginTop: 12 }}
        />

        <Text style={styles.footer}>© Destino · Angola</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoBox: {
    backgroundColor: colors.green,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: { fontSize: 36, fontWeight: '900', color: colors.white, letterSpacing: -1 },
  tagline: { color: colors.gold, marginTop: 6, fontWeight: '600', fontSize: 13 },
  title: { fontSize: 22, fontWeight: '800', color: colors.gray900, marginBottom: 20 },
  footer: { textAlign: 'center', color: colors.gray400, marginTop: 24, fontSize: 12 },
});
