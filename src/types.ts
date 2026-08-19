export type UserStatus = 'prospect' | 'registered_no_investment' | 'active_investor' | 'inactive_investor';
export type InvestorProfile = 'conservative' | 'moderate' | 'aggressive' | 'unknown';

export interface UserData {
  userId: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  totalInvested: number;
  activeFunds: string[];
  recurringContributionEnabled: boolean;
  recurringAmount: number | null;
  lastInvestmentDate: string | null;
  investorProfile: InvestorProfile;
  financialGoal: string;
  customerTenureDays: number;
  hasEverInvested: boolean;
  daysSinceLastInvestment: number | null;
  accountCreatedAt: string | null;
}

export interface Fund {
  id: string;
  name: string;
  objective: string;
  minimumInitial: number;
  minimumIncrement: number;
  minimumPermanence: string;
  projectedReturn: string;
  color: string;
  category: string;
  riskLevel: 'básico' | 'conservador' | 'moderado' | 'agresivo';
}

export const MOCK_FUNDS: Fund[] = [
  {
    id: 'mi-retiro',
    name: 'Mi Retiro',
    objective: 'Planificación del retiro y del futuro familiar',
    minimumInitial: 25,
    minimumIncrement: 25,
    minimumPermanence: '2 años',
    projectedReturn: '5.50% - 6.50%',
    color: 'bg-[#FCC710]',
    category: 'Jubilación',
    riskLevel: 'moderado'
  },
  {
    id: 'acumulacion',
    name: 'Acumulación',
    objective: 'Crecimiento sostenido a mediano plazo',
    minimumInitial: 50,
    minimumIncrement: 50,
    minimumPermanence: '1 año',
    projectedReturn: '4.50% - 5.50%',
    color: 'bg-[#1D9E84]',
    category: 'Crecimiento',
    riskLevel: 'conservador'
  },
  {
    id: 'oportunidad',
    name: 'Oportunidad',
    objective: 'Aprovechar ciclos del mercado',
    minimumInitial: 100,
    minimumIncrement: 100,
    minimumPermanence: '3 años',
    projectedReturn: '6.00% - 7.50%',
    color: 'bg-[#201D1A]',
    category: 'Agresivo',
    riskLevel: 'agresivo'
  },
  {
    id: 'renta',
    name: 'Renta',
    objective: 'Ingresos periódicos consistentes',
    minimumInitial: 500,
    minimumIncrement: 100,
    minimumPermanence: '1 año',
    projectedReturn: '5.00% - 6.00%',
    color: 'bg-[#EF942F]',
    category: 'Ingresos',
    riskLevel: 'conservador'
  },
  {
    id: 'productivo',
    name: 'Productivo',
    objective: 'Liquidez con rendimiento superior',
    minimumInitial: 200,
    minimumIncrement: 50,
    minimumPermanence: '90 días',
    projectedReturn: '4.00% - 5.00%',
    color: 'bg-[#1D9E84]',
    category: 'Liquidez',
    riskLevel: 'básico'
  },
  {
    id: 'cash',
    name: 'Cash',
    objective: 'Disponibilidad inmediata',
    minimumInitial: 25,
    minimumIncrement: 25,
    minimumPermanence: 'Ninguna',
    projectedReturn: '3.00% - 4.00%',
    color: 'bg-[#EF942F]',
    category: 'Liquidez',
    riskLevel: 'básico'
  }
];
