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
  'bg-[#1e1e1e] border border-border text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent w-full';

export default function CustomCutBuilder({
  dimensions,
  metrics,
  topNOptions,
  builderState,
  cut1AvailableValues,
  previewRows,
  onChange,
  onReset,
}) {
  const { cut1, cut2, metric, topN, selectedValues } = builderState;

  function handleValueToggle(v) {
    if (selectedValues.length === 0) {
      onChange('selectedValues', cut1AvailableValues.filter((x) => x !== v));
    } else if (selectedValues.includes(v)) {
      const next = selectedValues.filter((x) => x !== v);
      onChange('selectedValues', next);
    } else {
      onChange('selectedValues', [...selectedValues, v]);
    }
  }

  function isChecked(v) {
    return selectedValues.length === 0 || selectedValues.includes(v);
  }
  const chartData = previewRows.map((row) => ({
    name: row.label,
    value: row.rawValue ?? row.rawValue,
  }));

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

      {/* Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Field label="קבץ לפי">
          <select value={cut1} onChange={(e) => onChange('cut1', e.target.value)} className={SELECT_CLASS}>
            {dimensions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>

        <Field label="ואז לפי">
          <select value={cut2} onChange={(e) => onChange('cut2', e.target.value)} className={SELECT_CLASS}>
            <option value="">ללא</option>
            {dimensions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>

        <Field label="מדד">
          <select value={metric} onChange={(e) => onChange('metric', e.target.value)} className={SELECT_CLASS}>
            {metrics.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>

        <Field label="Top N">
          <select value={topN} onChange={(e) => onChange('topN', e.target.value)} className={SELECT_CLASS}>
            {topNOptions.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
      </div>

      {/* Value filter */}
      {cut1AvailableValues.length > 0 && (
        <div className="border border-border rounded-lg p-3 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted">
              סנן ערכי {cut1}
              {selectedValues.length > 0 && (
                <span className="text-accent mr-1">· {selectedValues.length} נבחרו</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => onChange('selectedValues', [])}
              className="text-xs text-muted hover:text-white transition-colors"
            >
              בחר הכל
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 max-h-36 overflow-y-auto pr-1">
            {cut1AvailableValues.map((v) => (
              <label key={v} className="flex items-center gap-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isChecked(v)}
                  onChange={() => handleValueToggle(v)}
                  className="accent-[#e85d04] w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-xs text-gray-300 group-hover:text-white transition-colors whitespace-nowrap">
                  {v}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {previewRows.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart */}
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 36 }}>
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
                <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: '#e5e5e5' }}
                  cursor={{ fill: 'rgba(232,93,4,0.1)' }}
                  formatter={(v) => [v.toLocaleString('he-IL'), metric]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right pb-3 text-muted font-medium">קבוצה</th>
                  <th className="text-right pb-3 text-muted font-medium">{metric}</th>
                  <th className="text-right pb-3 text-muted font-medium hidden sm:table-cell">מגמה</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr key={row.label} className="border-b border-border/50">
                    <td className="py-2.5 text-gray-200">{row.label}</td>
                    <td className="py-2.5 text-accent font-semibold">{row.displayValue}</td>
                    <td className="py-2.5 text-muted hidden sm:table-cell">{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-muted text-sm py-6 text-center">אין תוצאות לחיתוך הנוכחי</p>
      )}
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
