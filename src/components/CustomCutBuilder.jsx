import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#e85d04', '#f48c06', '#dc2626', '#b45309', '#7c3aed', '#0891b2', '#059669'];

const tooltipStyle = {
  backgroundColor: '#1a1010',
  border: '1px solid #3a2020',
  borderRadius: 8,
  color: '#e5e5e5',
  fontSize: 13,
};

const SELECT_CLASS =
  'bg-[#1e1e1e] border border-border text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent';

export default function CustomCutBuilder({
  metrics,
  topNOptions,
  builderState,
  cutFilterOptions,
  regionRows,
  municipalityRows,
  settlementRows,
  onChange,
  onReset,
  onClearFilters,
}) {
  const {
    metric, topN,
    filterRegions, filterMunicipalities, filterSettlements, filterThreats, filterDates,
  } = builderState;

  const { regions, municipalities, settlements, threats, dates } = cutFilterOptions;

  const hasActiveFilter =
    filterRegions.length > 0 || filterMunicipalities.length > 0 || filterSettlements.length > 0 ||
    filterThreats.length > 0 || filterDates.length > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-300">חיתוך מותאם אישית</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-muted hover:text-white border border-border rounded-lg px-3 py-1.5 transition-colors"
        >
          איפוס
        </button>
      </div>

      {/* Metric + TopN */}
      <div className="flex gap-3 mb-4">
        <label className="flex flex-col gap-1.5 flex-1">
          <span className="text-xs font-semibold text-muted">מדד</span>
          <select value={metric} onChange={(e) => onChange('metric', e.target.value)} className={SELECT_CLASS}>
            {metrics.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 w-28">
          <span className="text-xs font-semibold text-muted">Top N</span>
          <select value={topN} onChange={(e) => onChange('topN', e.target.value)} className={SELECT_CLASS}>
            {topNOptions.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      {/* Filter section */}
      <div className="border border-border rounded-lg p-3 mb-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted">
            סנן נתונים
            {hasActiveFilter && <span className="text-accent mr-1">· פעיל</span>}
          </span>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-xs text-muted hover:text-white transition-colors"
            >
              נקה סינון
            </button>
          )}
        </div>

        <MultiCheckbox
          label="אזורים"
          options={regions}
          selected={filterRegions}
          onChange={(v) => onChange('filterRegions', v)}
        />

        {municipalities.length > 0 && (
          <MultiCheckbox
            label="מועצות"
            options={municipalities}
            selected={filterMunicipalities}
            onChange={(v) => onChange('filterMunicipalities', v)}
          />
        )}

        {settlements.length > 0 && (
          <MultiCheckbox
            label="יישובים"
            options={settlements}
            selected={filterSettlements}
            onChange={(v) => onChange('filterSettlements', v)}
          />
        )}

        {threats.length > 0 && (
          <MultiCheckbox
            label="סוגי אירוע"
            options={threats}
            selected={filterThreats}
            onChange={(v) => onChange('filterThreats', v)}
          />
        )}

        {dates.length > 0 && (
          <MultiCheckbox
            label="תאריכים"
            options={dates}
            selected={filterDates}
            onChange={(v) => onChange('filterDates', v)}
          />
        )}
      </div>

      {/* 3 charts */}
      <div className="space-y-4">
        <GeoChart title="לפי אזור" rows={regionRows} metric={metric} />
        <GeoChart title="לפי מועצה" rows={municipalityRows} metric={metric} />
        <GeoChart title="לפי יישוב" rows={settlementRows} metric={metric} />
      </div>
    </div>
  );
}

function GeoChart({ title, rows, metric }) {
  if (!rows.length) return null;

  const data = rows.map((r) => ({ name: r.label, value: r.rawValue }));

  return (
    <div className="bg-[#111] border border-border/60 rounded-xl p-3 sm:p-4">
      <h3 className="text-xs font-semibold text-muted mb-3">{title}</h3>
      <div className="h-44 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -14, bottom: 36 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2020" vertical={false} />
            <XAxis
              dataKey="name"
              interval={0}
              tick={{ fill: '#888', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              height={48}
              tickMargin={8}
            />
            <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: '#e5e5e5' }}
              cursor={{ fill: 'rgba(232,93,4,0.08)' }}
              formatter={(v) => [v.toLocaleString('he-IL'), metric]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MultiCheckbox({ label, options, selected, onChange }) {
  const isAll = selected.length === 0;

  function toggle(v) {
    if (isAll) {
      onChange(options.filter((x) => x !== v));
    } else if (selected.includes(v)) {
      const next = selected.filter((x) => x !== v);
      onChange(next);
    } else {
      onChange([...selected, v]);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-muted">
          {label}
          {!isAll && <span className="text-accent mr-1">· {selected.length} נבחרו</span>}
        </span>
        {!isAll && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-muted hover:text-white transition-colors"
          >
            הכל
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 max-h-24 overflow-y-auto">
        {options.map((v) => (
          <label key={v} className="flex items-center gap-1.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={isAll || selected.includes(v)}
              onChange={() => toggle(v)}
              className="accent-[#e85d04] w-3.5 h-3.5 cursor-pointer"
            />
            <span className="text-xs text-gray-300 group-hover:text-white transition-colors whitespace-nowrap">
              {v}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
