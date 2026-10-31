import type { ContractType, Sphere } from './types';

// Vacancy filters (product rules §8), same logic as the app's FiltersSheet.
export type VacancyFilters = { urgent: boolean; spheres: Sphere[]; contracts: ContractType[]; country?: string; city?: string; min?: string; max?: string };
export const emptyFilters: VacancyFilters = { urgent: false, spheres: [], contracts: [] };
export const countFilters = (f: VacancyFilters) => (f.urgent ? 1 : 0) + f.spheres.length + f.contracts.length + (f.country ? 1 : 0) + (f.city ? 1 : 0) + (f.min || f.max ? 1 : 0);

type Filterable = { urgent: boolean; sphere: Sphere; city: string; country: string; pay: { amount: number; contract: ContractType } };

export function applyFilters<V extends Filterable>(list: V[], f: VacancyFilters) {
  return list.filter(
    (v) =>
      (!f.urgent || v.urgent) &&
      (!f.spheres.length || f.spheres.includes(v.sphere)) &&
      (!f.country || v.country === f.country) &&
      (!f.city || v.city === f.city) &&
      (!f.contracts.length || f.contracts.includes(v.pay.contract)) &&
      (!f.min || v.pay.amount >= Number(f.min)) &&
      (!f.max || v.pay.amount <= Number(f.max)),
  );
}

export const toggleIn = <T,>(arr: T[], x: T) => (arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x]);
