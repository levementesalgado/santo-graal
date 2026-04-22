import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllConabData,
  fetchFilteredData,
  fetchDataByState,
  fetchAvailableYears,
  fetchAvailableStates,
  upsertConabData,
} from '@/api/supabase';

export const QUERY_KEYS = {
  allData: ['conab', 'all'],
  filtered: (filters) => ['conab', 'filtered', filters],
  byState: (state) => ['conab', 'state', state],
  years: ['conab', 'years'],
  states: ['conab', 'states'],
};

export const useAllConabData = () =>
  useQuery({
    queryKey: QUERY_KEYS.allData,
    queryFn: fetchAllConabData,
    staleTime: 1000 * 60 * 10,
  });

export const useFilteredConabData = (filters) =>
  useQuery({
    queryKey: QUERY_KEYS.filtered(filters),
    queryFn: () => fetchFilteredData(filters),
    staleTime: 1000 * 60 * 5,
  });

export const useStateConabData = (state) =>
  useQuery({
    queryKey: QUERY_KEYS.byState(state),
    queryFn: () => fetchDataByState(state),
    enabled: !!state,
    staleTime: 1000 * 60 * 10,
  });

export const useAvailableYears = () =>
  useQuery({
    queryKey: QUERY_KEYS.years,
    queryFn: fetchAvailableYears,
    staleTime: 1000 * 60 * 30,
  });

export const useAvailableStates = () =>
  useQuery({
    queryKey: QUERY_KEYS.states,
    queryFn: fetchAvailableStates,
    staleTime: 1000 * 60 * 30,
  });

export const useSyncConabData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (records) => upsertConabData(records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conab'] });
    },
  });
};
