import { useEffect, useMemo, useRef, useState } from 'react';

const INPUT_CLASS =
  'w-full bg-[#1e1e1e] border border-border text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-40';

const TYPE_LABEL = { region: 'אזור', municipality: 'מועצה', settlement: 'יישוב' };
const TYPE_COLOR = { region: 'text-[#e85d04]', municipality: 'text-[#f48c06]', settlement: 'text-[#a3a3a3]' };

function SearchBox({ searchOptions, onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    const lower = q.toLowerCase();
    const hits = [];
    searchOptions.regions.forEach((v) => {
      if (v.toLowerCase().includes(lower)) hits.push({ type: 'region', value: v });
    });
    searchOptions.municipalities.forEach((v) => {
      if (v.toLowerCase().includes(lower)) hits.push({ type: 'municipality', value: v });
    });
    searchOptions.settlements.forEach((v) => {
      if (v.toLowerCase().includes(lower)) hits.push({ type: 'settlement', value: v });
    });
    return hits.slice(0, 20);
  }, [query, searchOptions]);

  function handleSelect(result) {
    onSelect(result);
    setQuery('');
    setOpen(false);
  }

  return (
    <div className="relative mb-4" ref={ref}>
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="חיפוש חופשי — אזור, מועצה או יישוב..."
          aria-label="חיפוש חופשי לפי אזור, מועצה או יישוב"
          autoComplete="off"
          className="w-full bg-[#1e1e1e] border border-border text-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg pr-9"
        />
        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-muted text-sm pointer-events-none">🔍</span>
      </div>

      {open && results.length > 0 && (
        <ul
          role="listbox"
          aria-label="תוצאות חיפוש"
          className="absolute top-full mt-1 right-0 left-0 z-40 bg-[#1e1e1e] border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto py-1"
        >
          {results.map((r, i) => (
            <li key={i} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full text-right flex items-center justify-between gap-3 px-3 py-2 hover:bg-white/[0.05] transition-colors focus:outline-none focus-visible:bg-white/[0.05]"
              >
                <span className="text-sm text-gray-200 truncate">{r.value}</span>
                <span className={`text-xs flex-shrink-0 ${TYPE_COLOR[r.type]}`}>{TYPE_LABEL[r.type]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-1 right-0 left-0 z-40 bg-[#1e1e1e] border border-border rounded-lg shadow-xl px-3 py-3 text-sm text-muted text-right">
          לא נמצאו תוצאות עבור &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}

export default function FilterBar({
  filters,
  onChange,
  onReset,
  onSearchSelect,
  options,
  searchOptions,
  availableMunicipalities,
  availableSettlements,
}) {
  const municipalityDisabled = !filters.region;
  const settlementDisabled = !filters.region && !filters.municipality;

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-300">פילטרים</h2>
        <button
          type="button"
          onClick={onReset}
          aria-label="איפוס כל הפילטרים"
          className="text-xs text-muted hover:text-white border border-border rounded-lg px-3 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          איפוס
        </button>
      </div>

      {searchOptions && (
        <SearchBox searchOptions={searchOptions} onSelect={onSearchSelect} />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Field label="מתאריך" id="filter-from-date">
          <input
            id="filter-from-date"
            type="date"
            value={filters.fromDate}
            onChange={(e) => onChange('fromDate', e.target.value)}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="עד תאריך" id="filter-to-date">
          <input
            id="filter-to-date"
            type="date"
            value={filters.toDate}
            onChange={(e) => onChange('toDate', e.target.value)}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="אזור" id="filter-region">
          <select
            id="filter-region"
            value={filters.region}
            onChange={(e) => onChange('region', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">כל האזורים</option>
            {options.regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>

        <Field label="מועצה" id="filter-municipality">
          <select
            id="filter-municipality"
            value={filters.municipality}
            disabled={municipalityDisabled}
            onChange={(e) => onChange('municipality', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">{municipalityDisabled ? 'בחרו אזור קודם' : 'כל המועצות'}</option>
            {availableMunicipalities.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>

        <Field label="יישוב" id="filter-settlement">
          <select
            id="filter-settlement"
            value={filters.settlement}
            disabled={settlementDisabled}
            onChange={(e) => onChange('settlement', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">{settlementDisabled ? 'בחרו אזור קודם' : 'כל היישובים'}</option>
            {availableSettlements.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="סוג אירוע" id="filter-threat">
          <select
            id="filter-threat"
            value={filters.threat}
            onChange={(e) => onChange('threat', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">כל הסוגים</option>
            {options.threats.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, id, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-muted">{label}</label>
      {children}
    </div>
  );
}