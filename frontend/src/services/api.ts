import axios, { create } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurável via variável EXPO_PUBLIC_API_URL (usada no Codemagic/EAS)
// Emulador Android: http://10.0.2.2:8010/api
// Dispositivo físico (dev): http://IP-DA-MAQUINA:8010/api
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.146.9:8010/api';

export const api = create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@destino:access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = await AsyncStorage.getItem('@destino:refresh');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh,
          });
          await AsyncStorage.setItem('@destino:access', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          await AsyncStorage.multiRemove(['@destino:access', '@destino:refresh']);
        }
      }
    }
    return Promise.reject(error);
  }
);

export type Provincia = {
  id: string;
  nome: string;
  slug: string;
  capital?: string;
  imagem?: string | null;
  total_pontos?: number;
  descricao?: string;
  pontos_turisticos?: PontoTuristico[];
};

export type PontoTuristico = {
  id: string;
  nome: string;
  slug: string;
  categoria: string;
  imagem?: string | null;
  provincia: string;
  provincia_nome?: string;
  descricao?: string;
  endereco?: string;
  preco_entrada: string;
  horario?: string;
  destaque: boolean;
};

export type Rota = {
  id: string;
  origem: string;
  origem_nome: string;
  destino: string;
  destino_nome: string;
  empresa: string;
  empresa_info?: { id: string; nome: string };
  preco_minimo: string;
  duracao_estimada_min: number;
  horarios?: Horario[];
};

export type Horario = {
  id: string;
  hora_saida: string;
  hora_chegada: string;
  preco: string;
  autocarro_info?: { id: string; matricula: string; modelo: string; classe: string };
  lugares_disponiveis?: number | null;
};

export type AssentoInfo = {
  numero: string;
  passageiro_nome?: string;
  passageiro_telefone?: string;
  passageiro_documento?: string;
};

export type Reserva = {
  id: string;
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'EXPIRADO';
  metodo_pagamento: string;
  preco_total: string;
  data_viagem: string;
  expira_em?: string | null;
  assentos: AssentoInfo[];
  bilhete?: { id: string; codigo: string; qr_code?: string | null; status: string };
  rota_resumo?: {
    origem: string;
    destino: string;
    empresa: string;
    hora_saida: string;
    hora_chegada: string;
  };
};

// ---------- Auth ----------
export const authApi = {
  login: async (username: string, password: string) => {
    const { data } = await api.post('/auth/token/', { username, password });
    await AsyncStorage.setItem('@destino:access', data.access);
    await AsyncStorage.setItem('@destino:refresh', data.refresh);
    return data;
  },
  register: async (payload: Record<string, string>) => {
    const { data } = await api.post('/auth/register/', payload);
    return data;
  },
  me: async () => {
    const { data } = await api.get('/auth/me/');
    return data;
  },
  logout: async () => {
    await AsyncStorage.multiRemove(['@destino:access', '@destino:refresh', '@destino:user']);
  },
};

// ---------- Turismo ----------
export const tourismApi = {
  destaques: async (): Promise<PontoTuristico[]> => {
    const { data } = await api.get('/pontos-turisticos/destaques/');
    return data;
  },
  provincias: async (): Promise<Provincia[]> => {
    const { data } = await api.get('/provincias/');
    return data.results ?? data;
  },
  provincia: async (slug: string): Promise<Provincia> => {
    const { data } = await api.get(`/provincias/${slug}/`);
    return data;
  },
  pontos: async (params?: Record<string, string>): Promise<PontoTuristico[]> => {
    const { data } = await api.get('/pontos-turisticos/', { params });
    return data.results ?? data;
  },
  ponto: async (slug: string): Promise<PontoTuristico> => {
    const { data } = await api.get(`/pontos-turisticos/${slug}/`);
    return data;
  },
};

// ---------- Rotas ----------
export const routesApi = {
  busca: async (origem: string, destino: string, data?: string): Promise<Rota[]> => {
    const { data: res } = await api.get('/rotas/busca/', {
      params: { origem, destino, ...(data ? { data } : {}) },
    });
    return res;
  },
  rota: async (id: string, data?: string): Promise<Rota> => {
    const { data: res } = await api.get(`/rotas/${id}/`, { params: data ? { data } : {} });
    return res;
  },
  assentos: async (horarioId: string, data: string) => {
    const { data: res } = await api.get(`/horarios/${horarioId}/assentos/`, {
      params: { data },
    });
    return res as { total_assentos: number; ocupados: string[]; disponiveis: number };
  },
};

// ---------- Reservas ----------
export const bookingsApi = {
  criar: async (payload: {
    horario: string;
    data_viagem: string;
    metodo_pagamento: string;
    assentos: AssentoInfo[];
  }): Promise<Reserva> => {
    const { data } = await api.post('/reservas/', payload);
    return data;
  },
  pagar: async (id: string, referencia?: string): Promise<Reserva> => {
    const { data } = await api.post(`/reservas/${id}/pagar/`, { referencia });
    return data;
  },
  minhas: async (): Promise<Reserva[]> => {
    const { data } = await api.get('/reservas/minhas/');
    return data;
  },
  get: async (id: string): Promise<Reserva> => {
    const { data } = await api.get(`/reservas/${id}/`);
    return data;
  },
};
