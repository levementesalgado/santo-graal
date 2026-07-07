import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchAllConabData,
  fetchFilteredData,
  fetchDataByState,
  fetchAvailableYears,
  fetchAvailableStates,
  upsertConabData,
} from '@/api/supabase';
import type { ConabRecord, ConabFilters } from '@/types';

export const QUERY_KEYS = {
  allData: ['conab', 'all'] as const,
  filtered: (filters: ConabFilters) => ['conab', 'filtered', filters] as const,
  byState: (state: string) => ['conab', 'state', state] as const,
  years: ['conab', 'years'] as const,
  states: ['conab', 'states'] as const,
};

const onQueryError = (err: Error) => {
  toast.error(err.message || 'Erro ao carregar dados do Supabase. Verifique a conexão.');
};

export const useAllConabData = () =>
  useQuery<ConabRecord[]>({
    queryKey: QUERY_KEYS.allData,
    queryFn: fetchAllConabData,
    staleTime: 1000 * 60 * 10,
  });

export const useFilteredConabData = (filters: ConabFilters) =>
  useQuery<ConabRecord[]>({
    queryKey: QUERY_KEYS.filtered(filters),
    queryFn: () => fetchFilteredData(filters),
    staleTime: 1000 * 60 * 5,
  });

export const useStateConabData = (state: string) =>
  useQuery<ConabRecord[]>({
    queryKey: QUERY_KEYS.byState(state),
    queryFn: () => fetchDataByState(state),
    enabled: !!state,
    staleTime: 1000 * 60 * 10,
  });

export const useAvailableYears = () =>
  useQuery<number[]>({
    queryKey: QUERY_KEYS.years,
    queryFn: fetchAvailableYears,
    staleTime: 1000 * 60 * 30,
  });

export const useAvailableStates = () =>
  useQuery<string[]>({
    queryKey: QUERY_KEYS.states,
    queryFn: fetchAvailableStates,
    staleTime: 1000 * 60 * 30,
  });

export const useSyncConabData = () => {
  const queryClient = useQueryClient();
  return useMutation<number, Error, ConabRecord[]>({
    mutationFn: (records) => upsertConabData(records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conab'] });
    },
  });
};
