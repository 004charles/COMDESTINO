import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

export type User = {
  id: number | string;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
};

type AuthContextData = {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (payload: Record<string, string>) => Promise<void>;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('@destino:user');
        const access = await AsyncStorage.getItem('@destino:access');
        if (stored && access) setUser(JSON.parse(stored));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (username: string, password: string) => {
    await authApi.login(username, password);
    const me = await authApi.me();
    await AsyncStorage.setItem('@destino:user', JSON.stringify(me));
    setUser(me);
  };

  const register = async (payload: Record<string, string>) => {
    await authApi.register(payload);
    await signIn(payload.username, payload.password);
  };

  const signOut = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
