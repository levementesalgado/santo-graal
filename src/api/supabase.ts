/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import type { ConabRecord, ConabFilters } from '@/types';

const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Variáveis de ambiente não configuradas.\n' +
    'Crie um arquivo .env na raiz do projeto com:\n' +
    '  VITE_SUPABASE_URL=https://seu-projeto.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=sua-chave-anon'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

const mapRowToConabData = (row: Record<string, unknown>): ConabRecord => ({
  id: row.id as string,
  year: row.year as number,
  state: row.state as string,
  region: row.region as string,
  crop: row.crop as string,
  production: row.production as number,
  productivity: row.productivity as number,
  area: row.area as number,
  timestamp: row.timestamp as string,
});

export const fetchAllConabData = async (): Promise<ConabRecord[]> => {
  const { data, error } = await supabase
    .from('conab_data')
    .select('*')
    .order('year', { ascending: true })
    .order('state', { ascending: true });
  if (error) throw new Error(`Falha ao buscar dados: ${error.message}`);
  return (data ?? []).map(mapRowToConabData);
};

export const fetchDataByState = async (state: string): Promise<ConabRecord[]> => {
  const { data, error } = await supabase
    .from('conab_data').select('*').eq('state', state).order('year', { ascending: true });
  if (error) throw new Error(`Falha ao buscar dados do estado ${state}: ${error.message}`);
  return (data ?? []).map(mapRowToConabData);
};

export const fetchDataByYear = async (year: number): Promise<ConabRecord[]> => {
  const { data, error } = await supabase
    .from('conab_data').select('*').eq('year', year).order('state', { ascending: true });
  if (error) throw new Error(`Falha ao buscar dados do ano ${year}: ${error.message}`);
  return (data ?? []).map(mapRowToConabData);
};

export const fetchFilteredData = async (filters: ConabFilters): Promise<ConabRecord[]> => {
  let query = supabase.from('conab_data').select('*');
  if (filters.years?.length > 0) query = query.in('year', filters.years);
  if (filters.states?.length > 0) query = query.in('state', filters.states);
  if (filters.crops?.length > 0) query = query.in('crop', filters.crops);
  const { data, error } = await query.order('year', { ascending: true }).order('state', { ascending: true });
  if (error) throw new Error(`Falha ao buscar dados filtrados: ${error.message}`);
  return (data ?? []).map(mapRowToConabData);
};

export const fetchAvailableYears = async (): Promise<number[]> => {
  const { data, error } = await supabase.from('conab_data').select('year').order('year', { ascending: false });
  if (error) throw new Error(`Falha ao buscar anos: ${error.message}`);
  return Array.from(new Set((data ?? []).map(d => d.year as number)));
};

export const fetchAvailableStates = async (): Promise<string[]> => {
  const { data, error } = await supabase.from('conab_data').select('state').order('state', { ascending: true });
  if (error) throw new Error(`Falha ao buscar estados: ${error.message}`);
  return Array.from(new Set((data ?? []).map(d => d.state as string)));
};

export const upsertConabData = async (records: ConabRecord[]): Promise<number> => {
  const rows = records.map(r => ({
    id: r.id, year: r.year, state: r.state, region: r.region, crop: r.crop,
    production: r.production, productivity: r.productivity, area: r.area,
    timestamp: new Date().toISOString(),
  }));
  const { data, error } = await supabase.from('conab_data').upsert(rows, { onConflict: 'id' }).select('id');
  if (error) throw new Error(`Falha ao salvar dados: ${error.message}`);
  return data?.length ?? 0;
};
