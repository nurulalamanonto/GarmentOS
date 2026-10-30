import { useFetch } from './useFetch.js';
import { fetchFactoryData } from '../api/moduleApi.js';

// Loads every factory record once: { data, isLoading, error, refetch }.
export const useFactoryData = () => useFetch(fetchFactoryData);
