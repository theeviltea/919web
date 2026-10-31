// Vacancy filters (product rules §8): All / Urgent, Sphere, Location, Pay. Sidebar on desktop, drawer on mobile.
import { useState } from 'react';
import { contractTypes, spheres, vacancySpheres } from '../data/dictionaries';
import { applyFilters, emptyFilters, toggleIn, type VacancyFilters } from '../data/filters';
import { allCountries, citiesFor } from '../data/registration';
import type { ContractType, Vacancy } from '../data/types';
import { Btn, Card, CheckRow, Drawer, Field, H2, Icon, Select } from './kit';

const CONTRACTS = Object.keys(contractTypes) as ContractType[];

export function FiltersBody({ value, onChange, source }: { value: VacancyFilters; onChange: (f: VacancyFilters) => void; source: Vacancy[] }) {
  const f = value;
  const set = (u: Partial<VacancyFilters>) => onChange({ ...f, ...u });
  const countIn = (s: string) => source.filter((v) => v.sphere === s && (!f.city || v.city === f.city)).length;
  return (
    <>
      <div className="tabs full" role="tablist">
        <button role="tab" aria-selected={!f.urgent} className={`tab${!f.urgent ? ' on' : ''}`} onClick={() => set({ urgent: false })}>
          All vacancies
        </button>
        <button role="tab" aria-selected={f.urgent} className={`tab${f.urgent ? ' on' : ''}`} onClick={() => set({ urgent: true })}>
          <Icon name="fire" size={16} />
          Urgent
        </button>
      </div>
      <div>
        <div className="s14 strong" style={{ marginBottom: 6 }}>
          Sphere
        </div>
        {vacancySpheres.map((s) => (
          <CheckRow key={s} on={f.spheres.includes(s)} onChange={() => set({ spheres: toggleIn(f.spheres, s) })} right={countIn(s)}>
            {spheres[s]}
          </CheckRow>
        ))}
      </div>
      <Select label="Country" value={f.country ?? ''} placeholder="Any country" options={allCountries.slice(0, 30)} onChange={(v) => set({ country: v || undefined, city: undefined })} />
      <Select label="City" value={f.city ?? ''} placeholder="Any city" options={citiesFor(f.country)} onChange={(v) => set({ city: v || undefined })} />
      <div>
        <div className="s14 strong" style={{ marginBottom: 8 }}>
          Pay
        </div>
        <div className="chips">
          {CONTRACTS.map((c) => (
            <button key={c} className={`chip${f.contracts.includes(c) ? ' on' : ''}`} style={{ height: 34, padding: '0 12px', fontSize: 13 }} onClick={() => set({ contracts: toggleIn(f.contracts, c) })}>
              {contractTypes[c].label}
            </button>
          ))}
        </div>
        <div className="grid2" style={{ marginTop: 12, gap: 8 }}>
          <Field label="From, AED" inputMode="numeric" value={f.min ?? ''} onChange={(v) => set({ min: v.replace(/\D/g, '') || undefined })} />
          <Field label="To, AED" inputMode="numeric" value={f.max ?? ''} onChange={(v) => set({ max: v.replace(/\D/g, '') || undefined })} />
        </div>
      </div>
    </>
  );
}

export function FiltersCard({ value, onChange, source }: { value: VacancyFilters; onChange: (f: VacancyFilters) => void; source: Vacancy[] }) {
  const n = applyFilters(source, value).length;
  return (
    <Card style={{ gap: 18 }}>
      <H2
        right={
          <button className="link s14" onClick={() => onChange(emptyFilters)}>
            Reset
          </button>
        }
      >
        Filters
      </H2>
      <FiltersBody value={value} onChange={onChange} source={source} />
      <div className="small muted">{n} vacancies match</div>
    </Card>
  );
}

export function FiltersDrawer({ value, onApply, onClose, source }: { value: VacancyFilters; onApply: (f: VacancyFilters) => void; onClose: () => void; source: Vacancy[] }) {
  const [f, setF] = useState(value);
  const n = applyFilters(source, f).length;
  return (
    <Drawer onClose={onClose} label="Filters">
      <div className="row g12" style={{ padding: '24px 28px 16px' }}>
        <h2 className="display d4 grow">Filters</h2>
        <button className="link s14" onClick={() => setF(emptyFilters)}>
          Reset
        </button>
        <button className="iconbtn soft" aria-label="Close" onClick={onClose}>
          <Icon name="cancel" />
        </button>
      </div>
      <div className="body col g18">
        <FiltersBody value={f} onChange={setF} source={source} />
      </div>
      <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--divider)' }}>
        <Btn h={56} full onClick={() => onApply(f)}>
          Show {n} vacancies
        </Btn>
      </div>
    </Drawer>
  );
}
