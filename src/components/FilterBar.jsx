const INPUT_CLASS =
  'w-full bg-[#1e1e1e] border border-border text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-40';

export default function FilterBar({
  filters,
  onChange,
  onReset,
  options,
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
          className="text-xs text-muted hover:text-white border border-border rounded-lg px-3 py-1.5 transition-colors"
        >
          איפוס
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Field label="מתאריך">
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => onChange('fromDate', e.target.value)}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="עד תאריך">
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => onChange('toDate', e.target.value)}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="אזור">
          <select
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

        <Field label="מועצה">
          <select
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

        <Field label="יישוב">
          <select
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

        <Field label="סוג אירוע">
          <select
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

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}
