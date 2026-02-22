import { ConabData } from '@/lib/index';

/**
 * Dados Históricos Consolidados da CONAB (2018-2026)
 * Este dataset simula o processamento de CSVs reais da CONAB, refletindo a bienalidade
 * do café arábica e a expansão tecnológica do conillon/robusta no Brasil.
 */
const CURRENT_TS = new Date().toISOString();

export const conabHistoricalData: ConabData[] = [
  // --- MINAS GERAIS (Principal Produtor de Arábica) ---
  { id: 'mg-2018', year: 2018, state: 'MG', region: 'SUDESTE', crop: 'Café Arábica', production: 33400, productivity: 1810, area: 1108, timestamp: CURRENT_TS },
  { id: 'mg-2019', year: 2019, state: 'MG', region: 'SUDESTE', crop: 'Café Arábica', production: 24500, productivity: 1330, area: 1105, timestamp: CURRENT_TS },
  { id: 'mg-2020', year: 2020, state: 'MG', region: 'SUDESTE', crop: 'Café Arábica', production: 34650, productivity: 1880, area: 1105, timestamp: CURRENT_TS },
  { id: 'mg-2021', year: 2021, state: 'MG', region: 'SUDESTE', crop: 'Café Arábica', production: 22140, productivity: 1210, area: 1100, timestamp: CURRENT_TS },
  { id: 'mg-2022', year: 2022, state: 'MG', region: 'SUDESTE', crop: 'Café Arábica', production: 28450, productivity: 1550, area: 1102, timestamp: CURRENT_TS },
  { id: 'mg-2023', year: 2023, state: 'MG', region: 'SUDESTE', crop: 'Café Arábica', production: 29020, productivity: 1585, area: 1098, timestamp: CURRENT_TS },
  { id: 'mg-2024', year: 2024, state: 'MG', region: 'SUDESTE', crop: 'Café Arábica', production: 31500, productivity: 1720, area: 1100, timestamp: CURRENT_TS },
  { id: 'mg-2025', year: 2025, state: 'MG', region: 'SUDESTE', crop: 'Café Arábica', production: 32800, productivity: 1790, area: 1100, timestamp: CURRENT_TS },
  { id: 'mg-2026', year: 2026, state: 'MG', region: 'SUDESTE', crop: 'Café Arábica', production: 34100, productivity: 1860, area: 1100, timestamp: CURRENT_TS },

  // --- ESPÍRITO SANTO (Líder em Conillon/Robusta) ---
  { id: 'es-2018', year: 2018, state: 'ES', region: 'SUDESTE', crop: 'Café Conillon', production: 9200, productivity: 1880, area: 294, timestamp: CURRENT_TS },
  { id: 'es-2019', year: 2019, state: 'ES', region: 'SUDESTE', crop: 'Café Conillon', production: 9800, productivity: 2005, area: 293, timestamp: CURRENT_TS },
  { id: 'es-2020', year: 2020, state: 'ES', region: 'SUDESTE', crop: 'Café Conillon', production: 10150, productivity: 2080, area: 293, timestamp: CURRENT_TS },
  { id: 'es-2021', year: 2021, state: 'ES', region: 'SUDESTE', crop: 'Café Conillon', production: 11200, productivity: 2290, area: 294, timestamp: CURRENT_TS },
  { id: 'es-2022', year: 2022, state: 'ES', region: 'SUDESTE', crop: 'Café Conillon', production: 12350, productivity: 2510, area: 295, timestamp: CURRENT_TS },
  { id: 'es-2023', year: 2023, state: 'ES', region: 'SUDESTE', crop: 'Café Conillon', production: 13800, productivity: 2800, area: 296, timestamp: CURRENT_TS },
  { id: 'es-2024', year: 2024, state: 'ES', region: 'SUDESTE', crop: 'Café Conillon', production: 14500, productivity: 2950, area: 295, timestamp: CURRENT_TS },
  { id: 'es-2025', year: 2025, state: 'ES', region: 'SUDESTE', crop: 'Café Conillon', production: 15400, productivity: 3120, area: 296, timestamp: CURRENT_TS },
  { id: 'es-2026', year: 2026, state: 'ES', region: 'SUDESTE', crop: 'Café Conillon', production: 16100, productivity: 3260, area: 296, timestamp: CURRENT_TS },

  // --- SÃO PAULO ---
  { id: 'sp-2018', year: 2018, state: 'SP', region: 'SUDESTE', crop: 'Café Arábica', production: 6450, productivity: 1920, area: 201, timestamp: CURRENT_TS },
  { id: 'sp-2020', year: 2020, state: 'SP', region: 'SUDESTE', crop: 'Café Arábica', production: 6200, productivity: 1850, area: 201, timestamp: CURRENT_TS },
  { id: 'sp-2022', year: 2022, state: 'SP', region: 'SUDESTE', crop: 'Café Arábica', production: 4300, productivity: 1285, area: 201, timestamp: CURRENT_TS },
  { id: 'sp-2024', year: 2024, state: 'SP', region: 'SUDESTE', crop: 'Café Arábica', production: 5400, productivity: 1620, area: 200, timestamp: CURRENT_TS },
  { id: 'sp-2026', year: 2026, state: 'SP', region: 'SUDESTE', crop: 'Café Arábica', production: 5850, productivity: 1760, area: 200, timestamp: CURRENT_TS },

  // --- RONDÔNIA ---
  { id: 'ro-2018', year: 2018, state: 'RO', region: 'NORTE', crop: 'Café Robusta', production: 2150, productivity: 1980, area: 65, timestamp: CURRENT_TS },
  { id: 'ro-2020', year: 2020, state: 'RO', region: 'NORTE', crop: 'Café Robusta', production: 2420, productivity: 2230, area: 65, timestamp: CURRENT_TS },
  { id: 'ro-2022', year: 2022, state: 'RO', region: 'NORTE', crop: 'Café Robusta', production: 2650, productivity: 2450, area: 65, timestamp: CURRENT_TS },
  { id: 'ro-2024', year: 2024, state: 'RO', region: 'NORTE', crop: 'Café Robusta', production: 2900, productivity: 2680, area: 65, timestamp: CURRENT_TS },
  { id: 'ro-2026', year: 2026, state: 'RO', region: 'NORTE', crop: 'Café Robusta', production: 3120, productivity: 2880, area: 65, timestamp: CURRENT_TS },

  // --- BAHIA ---
  { id: 'ba-2018', year: 2018, state: 'BA', region: 'NORDESTE', crop: 'Café Arábica', production: 3800, productivity: 1300, area: 175, timestamp: CURRENT_TS },
  { id: 'ba-2020', year: 2020, state: 'BA', region: 'NORDESTE', crop: 'Café Arábica', production: 3950, productivity: 1350, area: 175, timestamp: CURRENT_TS },
  { id: 'ba-2022', year: 2022, state: 'BA', region: 'NORDESTE', crop: 'Café Arábica', production: 3600, productivity: 1230, area: 175, timestamp: CURRENT_TS },
  { id: 'ba-2024', year: 2024, state: 'BA', region: 'NORDESTE', crop: 'Café Arábica', production: 4100, productivity: 1405, area: 175, timestamp: CURRENT_TS },
  { id: 'ba-2026', year: 2026, state: 'BA', region: 'NORDESTE', crop: 'Café Arábica', production: 4250, productivity: 1460, area: 175, timestamp: CURRENT_TS },

  // --- OUTROS ESTADOS (Dados de Referência 2026) ---
  { id: 'pr-2026', year: 2026, state: 'PR', region: 'SUL', crop: 'Café Arábica', production: 850, productivity: 1250, area: 41, timestamp: CURRENT_TS },
  { id: 'go-2026', year: 2026, state: 'GO', region: 'CENTRO-OESTE', crop: 'Café Arábica', production: 320, productivity: 1480, area: 13, timestamp: CURRENT_TS },
  { id: 'rj-2026', year: 2026, state: 'RJ', region: 'SUDESTE', crop: 'Café Arábica', production: 240, productivity: 1150, area: 12, timestamp: CURRENT_TS },
  { id: 'mt-2026', year: 2026, state: 'MT', region: 'CENTRO-OESTE', crop: 'Café Robusta', production: 180, productivity: 1320, area: 8, timestamp: CURRENT_TS }
];

/**
 * Agrupamento de dados por estado para análises regionais comparativas.
 */
export const stateData = conabHistoricalData.reduce((acc, curr) => {
  if (!acc[curr.state]) acc[curr.state] = [];
  acc[curr.state].push(curr);
  return acc;
}, {} as Record<string, ConabData[]>);

/**
 * Agrupamento por tipo de cultura para análise de mercado e fitogeografia.
 */
export const cropData = conabHistoricalData.reduce((acc, curr) => {
  if (!acc[curr.crop]) acc[curr.crop] = [];
  acc[curr.crop].push(curr);
  return acc;
}, {} as Record<string, ConabData[]>);

/**
 * Mapeamento otimizado para séries temporais de produtividade.
 */
export const productivityData = conabHistoricalData.map(d => ({
  state: d.state,
  year: d.year,
  value: d.productivity,
  region: d.region
}));
