const fieldLabels = {
  fromDate: 'מתאריך',
  toDate: 'עד תאריך',
  region: 'אזור',
  municipality: 'מועצה',
  settlement: 'יישוב',
  threat: 'סוג אירוע',
};

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
    <section className="panel">
      <div className="panel__head">
        <div>
          <p className="eyebrow">Filter Bar</p>
          <h2>פילטרים גלובליים</h2>
        </div>
        <button className="ghost-button" type="button" onClick={onReset}>
          איפוס פילטרים
        </button>
      </div>

      <div className="filter-grid">
        <DateField
          label={fieldLabels.fromDate}
          value={filters.fromDate}
          onChange={(value) => onChange('fromDate', value)}
        />
        <DateField
          label={fieldLabels.toDate}
          value={filters.toDate}
          onChange={(value) => onChange('toDate', value)}
        />
        <SelectField
          label={fieldLabels.region}
          value={filters.region}
          placeholder="בחרו אזור"
          options={options.regions}
          onChange={(value) => onChange('region', value)}
        />
        <SelectField
          label={fieldLabels.municipality}
          value={filters.municipality}
          disabled={municipalityDisabled}
          placeholder={municipalityDisabled ? 'קודם בחרו אזור' : 'בחרו מועצה'}
          options={availableMunicipalities}
          emptyMessage="אין מועצות זמינות עבור האזור שנבחר"
          onChange={(value) => onChange('municipality', value)}
        />
        <SelectField
          label={fieldLabels.settlement}
          value={filters.settlement}
          disabled={settlementDisabled}
          placeholder={settlementDisabled ? 'קודם בחרו אזור או מועצה' : 'בחרו יישוב'}
          options={availableSettlements}
          emptyMessage="אין יישובים זמינים עבור הסינון הנוכחי"
          onChange={(value) => onChange('settlement', value)}
        />
        <SelectField
          label={fieldLabels.threat}
          value={filters.threat}
          placeholder="כל סוגי האירוע"
          options={options.threats}
          onChange={(value) => onChange('threat', value)}
        />
      </div>
    </section>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({ label, value, options, placeholder, disabled, emptyMessage, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {!disabled && !options.length && emptyMessage ? <small>{emptyMessage}</small> : null}
    </label>
  );
}
