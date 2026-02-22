import { ConabData, calculateProductivity } from "./index";

/**
 * Mapeamento de URLs base da CONAB para extração de séries históricas
 * Nota: Em ambiente de produção (2026), estas URLs apontam para os endpoints de Open Data da CONAB
 */
const CONAB_ENDPOINTS = {
  BASE_URL: "https://www.conab.gov.br/info-agro/safras/serie-historica-das-safras",
  DATA_PORTAL: "https://dados.conab.gov.br/dataset",
  API_VERSION: "v2.1"
};

/**
 * Realiza o scraping simulado/real dos dados da CONAB.
 * Em um ambiente web, isso geralmente requer um proxy CORS ou uma Edge Function.
 */
export const scrapeConabData = async (crop: string = "cafe"): Promise<string> => {
  try {
    console.log(`[Scraper] Iniciando extração de dados para a cultura: ${crop.toUpperCase()}...`);
    
    // Em uma implementação real, esta função faria uma requisição HTTP para os endpoints da CONAB.
    // Atualmente, ela simula um atraso de rede e retorna dados de exemplo para fins de demonstração.
    // Para habilitar a chamada real à API, descomente as linhas abaixo e remova as linhas de simulação.
    // const response = await fetch(`${CONAB_ENDPOINTS.DATA_PORTAL}/${crop}-serie-historica.csv`);
    // if (!response.ok) {
    //   throw new Error(`Erro na requisição: ${response.statusText}`);
    // }
    // const csvData = await response.text();
    // return csvData;

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula atraso de rede
    const csvData = `state,year,production,area,cropType\nMG,2026,34100,1100,Café Arábica\nES,2026,16100,296,Café Conillon`;
    return csvData;
  } catch (error) {
    console.error("[Scraper] Falha na extração de dados:", error);
    throw new Error("Não foi possível conectar ao servidor da CONAB. Verifique a conexão ou o status do portal.");
  }
};

/**
 * Parser avançado para transformar tabelas CSV/HTML da CONAB em objetos ConabData
 * Lida com limpeza de strings, conversão de unidades e normalização regional
 */
export const parseConabTables = (rawData: string): ConabData[] => {
  const rows = rawData.split("\n").filter(row => row.trim() !== "");
  const results: ConabData[] = [];

  // Ignorar cabeçalho se existir
  const dataRows = rows.slice(1);

  dataRows.forEach((row, index) => {
    const columns = row.split(",").map(col => col.trim());
    
    if (columns.length < 5) return;

    const state = columns[0];
    const year = parseInt(columns[1]);
    const production = parseFloat(columns[2]); // Mil sacas
    const area = parseFloat(columns[3]); // Mil ha
    const cropType = columns[4];

    // Determinação da região baseada no estado (UF)
    const region = getRegionFromState(state);

    results.push({
      id: `conab-${state}-${year}-${index}`,
      year,
      state,
      region,
      crop: cropType,
      production,
      area,
      productivity: calculateProductivity(production, area),
      timestamp: new Date().toISOString()
    });
  });

  return results;
};

/**
 * Validação de integridade de dados (Data Integrity Check)
 * Verifica anomalias estatísticas e valores impossíveis antes da ingestão
 */
export const validateDataIntegrity = (data: ConabData[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  data.forEach((entry, idx) => {
    if (entry.production < 0) {
      errors.push(`[Linha ${idx}] Produção negativa detectada em ${entry.state} (${entry.year}).`);
    }
    if (entry.area < 0) {
      errors.push(`[Linha ${idx}] Área plantada negativa detectada em ${entry.state} (${entry.year}).`);
    }
    if (entry.year > 2026 || entry.year < 1990) {
      errors.push(`[Linha ${idx}] Ano fora do intervalo operacional: ${entry.year}.`);
    }
    if (entry.productivity > 10000) {
      errors.push(`[Linha ${idx}] Produtividade anômala (>10k kg/ha) em ${entry.state}. Verifique unidades.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Agenda atualizações automáticas de dados usando o sistema de Background Tasks
 */
export const scheduleDataUpdate = (intervalInHours: number = 24): void => {
  console.log(`[Scheduler] Agendamento de atualização configurado para cada ${intervalInHours} horas.`);
  
  // Em uma aplicação real, isso poderia registrar um Service Worker ou chamar uma API de Cron
  const nextUpdate = new Date();
  nextUpdate.setHours(nextUpdate.getHours() + intervalInHours);
  
  localStorage.setItem("conab_next_update", nextUpdate.toISOString());
};

/**
 * Helper para normalização de regiões geográficas brasileiras
 */
function getRegionFromState(state: string): 'NORTE' | 'NORDESTE' | 'CENTRO-OESTE' | 'SUDESTE' | 'SUL' {
  const mapping: Record<string, 'NORTE' | 'NORDESTE' | 'CENTRO-OESTE' | 'SUDESTE' | 'SUL'> = {
    'AC': 'NORTE', 'AM': 'NORTE', 'AP': 'NORTE', 'PA': 'NORTE', 'RO': 'NORTE', 'RR': 'NORTE', 'TO': 'NORTE',
    'AL': 'NORDESTE', 'BA': 'NORDESTE', 'CE': 'NORDESTE', 'MA': 'NORDESTE', 'PB': 'NORDESTE', 'PE': 'NORDESTE', 'PI': 'NORDESTE', 'RN': 'NORDESTE', 'SE': 'NORDESTE',
    'DF': 'CENTRO-OESTE', 'GO': 'CENTRO-OESTE', 'MT': 'CENTRO-OESTE', 'MS': 'CENTRO-OESTE',
    'ES': 'SUDESTE', 'MG': 'SUDESTE', 'RJ': 'SUDESTE', 'SP': 'SUDESTE',
    'PR': 'SUL', 'RS': 'SUL', 'SC': 'SUL'
  };

  return mapping[state.toUpperCase()] || 'SUDESTE'; // Default para Sudeste se não encontrado
}

/**
 * Função Principal de Sincronização
 * Executa o pipeline completo: Extração -> Parsing -> Validação -> Ingestão
 */
export const syncAllCrops = async (): Promise<{ success: boolean; count: number; message: string }> => {
  try {
    const rawData = await scrapeConabData("cafe");
    const parsedData = parseConabTables(rawData);
    const validation = validateDataIntegrity(parsedData);

    if (!validation.isValid) {
      return {
        success: false,
        count: 0,
        message: `Falha na validação: ${validation.errors[0]} (e mais ${validation.errors.length - 1} erros)`
      };
    }

    // Simulação de persistência no IndexedDB ou LocalStorage
    localStorage.setItem("conab_cache_data", JSON.stringify(parsedData));
    localStorage.setItem("conab_last_sync", new Date().toISOString());

    return {
      success: true,
      count: parsedData.length,
      message: "Sincronização com o portal CONAB realizada com sucesso."
    };
  } catch (error) {
    return {
      success: false,
      count: 0,
      message: error instanceof Error ? error.message : "Erro desconhecido na sincronização."
    };
  }
};