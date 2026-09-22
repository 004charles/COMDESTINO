export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  ProvincePicker: { title: string; onSelect: (slug: string) => void };
  SearchResults: { origem: string; destino: string; data?: string };
  Attraction: { slug: string };
  Seats: {
    horarioId: string;
    rotaId: string;
    origem: string;
    destino: string;
    empresa: string;
    horaSaida: string;
    horaChegada: string;
    preco: string;
    data: string;
  };
  Passenger: {
    horarioId: string;
    origem: string;
    destino: string;
    empresa: string;
    horaSaida: string;
    data: string;
    preco: string;
    assentos: string[];
  };
  Payment: {
    reservaId: string;
    total: string;
    metodo: 'MCX' | 'BALCAO';
    mcxPhone: string;
    origem: string;
    destino: string;
    empresa: string;
    horaSaida: string;
    data: string;
    assentos: string;
  };
  Success: { reservaId: string };
  TicketDetail: { reservaId: string };
  Explore: undefined;
  Tickets: undefined;
};

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Tickets: undefined;
  Profile: undefined;
};
