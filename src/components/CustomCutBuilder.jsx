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

const INPUT_CLASS =
  'w-full bg-[#1e1e1e] border border-border text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-40';


export default function CustomCutBuilder({
  metrics,
  topNOptions,
  builderState,
  cutFilterOptions,
  regionRows,
  municipalityRows,
  settlementRows,
  today,
  onChange,
  onReset,
}) {
  const {
    metric, topN,
    filterRegion, filterMunicipality, filterSettlement,
    filterThreat, filterFromDate, filterToDate,
  } = builderState;

  const { regions, municipalities, settlements, threats } = cutFilterOptions;

  const hasActiveFilter =
    filterRegion || filterMunicipality || filterSettlement ||
    filterThreat || filterFromDate !== '2026-03-01' || filterToDate !== today;

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-medium text-gray-300">ניתוח גיאוגרפי</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-muted hover:text-white border border-border rounded-lg px-3 py-1.5 transition-colors"
        >
          איפוס
        </button>
      </div>

      {/* Controls row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Field label="מדד">
          <select value={metric} onChange={(e) => onChange('metric', e.target.value)} className={INPUT_CLASS}>
            {metrics.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>

        <Field label="Top N">
          <select value={topN} onChange={(e) => onChange('topN', e.target.value)} className={INPUT_CLASS}>
            {topNOptions.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>

        <Field label="מתאריך">
          <input
            type="date"
            value={filterFromDate}
            min="2026-03-01"
            max={filterToDate || today}
            onChange={(e) => onChange('filterFromDate', e.target.value)}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="עד תאריך">
          <input
            type="date"
            value={filterToDate}
            min={filterFromDate || '2026-03-01'}
            max={today}
            onChange={(e) => onChange('filterToDate', e.target.value)}
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      {/* Location + threat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Field label="אזור">
          <select
            value={filterRegion}
            onChange={(e) => onChange('filterRegion', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">כל האזורים</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>

        <Field label="מועצה">
          <select
            value={filterMunicipality}
            disabled={!filterRegion}
            onChange={(e) => onChange('filterMunicipality', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">{filterRegion ? 'כל המועצות' : 'בחרו אזור קודם'}</option>
            {municipalities.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>

        <Field label="יישוב">
          <select
            value={filterSettlement}
            disabled={!filterRegion}
            onChange={(e) => onChange('filterSettlement', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">{filterRegion ? 'כל היישובים' : 'בחרו אזור קודם'}</option>
            {settlements.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="סוג אירוע">
          <select
            value={filterThreat}
            onChange={(e) => onChange('filterThreat', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">כל הסוגים</option>
            {threats.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>

      {/* 3 geo charts */}
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
      <div className="h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -14, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2020" vertical={false} />
            <XAxis
              dataKey="name"
              interval={0}
              angle={-35}
              textAnchor="end"
              tickFormatter={(v) => v.length > 14 ? v.slice(0, 13) + '…' : v}
              tick={{ fill: '#888', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              height={70}
              tickMargin={4}
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

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}
