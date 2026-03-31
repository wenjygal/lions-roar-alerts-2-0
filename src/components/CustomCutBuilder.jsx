import { useEffect, useRef, useState } from 'react';
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
  'bg-[#1e1e1e] border border-border text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg';

function XTick({ x, y, payload }) {
  const v = String(payload.value);
  const label = v.length > 8 ? v.slice(0, 7) + '…' : v;
  return (
    <text x={x} y={y + 14} textAnchor="middle" fill="#888" fontSize={11}>
      {label}
    </text>
  );
}

function formatDate(iso) {
  const p = iso.split('-');
  return `${p[2]}.${p[1]}`;
}

/* ---------- Multi-select dropdown ---------- */
function MultiDropdown({ label, options, selected, onChange, formatLabel, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const hasSelection = selected.length > 0;
  const display = formatLabel || ((v) => v);

  function toggle(v) {
    if (selected.includes(v)) {
      onChange(selected.filter((x) => x !== v));
    } else {
      onChange([...selected, v]);
    }
  }

  const buttonLabel = hasSelection
    ? `${label} · ${selected.length} נבחרו`
    : (placeholder || `כל ה${label}`);

  return (
    <div className="flex flex-col gap-1.5 relative" ref={ref}>
      <span className="text-xs font-semibold text-muted">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${label}: ${buttonLabel}`}
        className="flex items-center justify-between gap-2 bg-[#1e1e1e] border border-border text-gray-200 rounded-lg px-3 py-2 text-sm hover:border-muted transition-colors text-right w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <span className={`truncate ${hasSelection ? 'text-accent' : 'text-muted'}`}>{buttonLabel}</span>
        <span className="text-muted text-xs flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 z-30 bg-[#1e1e1e] border border-border rounded-lg shadow-xl min-w-full w-max max-w-xs">
          {/* Clear all */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-muted hover:text-white transition-colors"
            >
              נקה הכל
            </button>
            {hasSelection && (
              <span className="text-xs text-accent">{selected.length} נבחרו</span>
            )}
          </div>
          {/* Options — nothing checked by default */}
          <div className="max-h-52 overflow-y-auto py-1">
            {options.map((v) => (
              <label
                key={v}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-white/[0.04] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(v)}
                  onChange={() => toggle(v)}
                  className="accent-[#e85d04] w-3.5 h-3.5 flex-shrink-0 cursor-pointer"
                />
                <span className="text-sm text-gray-200 whitespace-nowrap">{display(v)}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Main component ---------- */
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
}) {
  const {
    metric, topN,
    filterRegions, filterMunicipalities, filterSettlements,
    filterThreats, filterDates,
  } = builderState;

  const { regions, municipalities, settlements, threats, dates } = cutFilterOptions;

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-medium text-gray-300">ניתוח גיאוגרפי</h2>
        <button
          type="button"
          onClick={onReset}
          aria-label="איפוס ניתוח גיאוגרפי"
          className="text-xs text-muted hover:text-white border border-border rounded-lg px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          איפוס
        </button>
      </div>

      {/* Row 1: metric + topN */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted">מדד</span>
          <select value={metric} onChange={(e) => onChange('metric', e.target.value)} className={SELECT_CLASS}>
            {metrics.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted">Top N</span>
          <select value={topN} onChange={(e) => onChange('topN', e.target.value)} className={SELECT_CLASS}>
            {topNOptions.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      {/* Row 2: location dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <MultiDropdown
          label="אזור"
          options={regions}
          selected={filterRegions}
          onChange={(v) => onChange('filterRegions', v)}
          placeholder="כל האזורים"
        />
        <MultiDropdown
          label="מועצה"
          options={municipalities}
          selected={filterMunicipalities}
          onChange={(v) => onChange('filterMunicipalities', v)}
          placeholder={filterRegions.length ? 'כל המועצות' : 'בחרו אזור קודם'}
        />
        <MultiDropdown
          label="יישוב"
          options={settlements}
          selected={filterSettlements}
          onChange={(v) => onChange('filterSettlements', v)}
          placeholder={filterRegions.length ? 'כל היישובים' : 'בחרו אזור קודם'}
        />
      </div>

      {/* Row 3: threat + dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <MultiDropdown
          label="סוג אירוע"
          options={threats}
          selected={filterThreats}
          onChange={(v) => onChange('filterThreats', v)}
          placeholder="כל הסוגים"
        />
        <MultiDropdown
          label="תאריכים"
          options={dates}
          selected={filterDates}
          onChange={(v) => onChange('filterDates', v)}
          formatLabel={formatDate}
          placeholder="כל התאריכים"
        />
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

/* ---------- Geo chart ---------- */
function GeoChart({ title, rows, metric }) {
  if (!rows.length) return null;
  const data = rows.map((r) => ({ name: r.label, value: r.rawValue }));

  return (
    <div className="bg-[#111] border border-border/60 rounded-xl p-3 sm:p-4" role="img" aria-label={`גרף עמודות: ${title}`}>
      <h3 className="text-xs font-semibold text-muted mb-3">{title}</h3>
      <div className="h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -14, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2020" vertical={false} />
            <XAxis
              dataKey="name"
              interval={0}
              tick={<XTick />}
              axisLine={false}
              tickLine={false}
              height={36}
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
