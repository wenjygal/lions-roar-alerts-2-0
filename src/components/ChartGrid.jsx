import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ComposedChart, Line,
} from 'recharts';

const COLORS = ['#e85d04', '#f48c06', '#dc2626', '#b45309', '#7c3aed', '#0891b2', '#059669'];

const tooltipStyle = {
  backgroundColor: '#1a1010',
  border: '1px solid #3a2020',
  borderRadius: 8,
  color: '#e5e5e5',
  fontSize: 13,
};
const tooltipItemStyle = { color: '#e5e5e5' };
const tooltipLabelStyle = { color: '#aaa', marginBottom: 4 };

function DateXTick({ x, y, payload }) {
  const v = String(payload.value);
  // YYYY-MM-DD → MM-DD
  const label = v.length >= 7 ? v.slice(5) : v;
  return (
    <text x={x} y={y + 12} textAnchor="middle" fill="#888" fontSize={10}>
      {label}
    </text>
  );
}

function XTick({ x, y, payload }) {
  const v = String(payload.value);
  const label = v.length > 8 ? v.slice(0, 7) + '…' : v;
  return (
    <text x={x} y={y + 14} textAnchor="middle" fill="#888" fontSize={11}>
      {label}
    </text>
  );
}

function toRechartsData(bars) {
  return bars.map((bar) => ({ name: bar.label, value: bar.rawValue ?? bar.value }));
}

function DonutChart({ title, bars }) {
  const data = toRechartsData(bars);
  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-5">
      <h2 className="text-sm font-medium text-gray-300 mb-4">{title}</h2>
      <div className="h-72" role="img" aria-label={`תרשים עוגה: ${title}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="40%" innerRadius={55} outerRadius={80} dataKey="value" nameKey="name">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
              formatter={(v, n) => [v.toLocaleString('he-IL'), n]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(v) => (
                <span style={{ color: '#ccc', fontSize: 12 }}>{v}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BarChartCard({ title, bars, compact }) {
  const data = toRechartsData(bars);
  const height = compact ? 'h-40 sm:h-48' : 'h-44 sm:h-60';
  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-5">
      <h2 className="text-sm font-medium text-gray-300 mb-4">{title}</h2>
      <div className={height} role="img" aria-label={`תרשים עמודות: ${title}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2020" vertical={false} />
            <XAxis
              dataKey="name"
              interval={0}
              tick={<XTick />}
              axisLine={false}
              tickLine={false}
              height={36}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
              cursor={{ fill: 'rgba(232,93,4,0.1)' }}
              formatter={(v) => [v.toLocaleString('he-IL'), 'אזעקות']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#e85d04">
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

function DailyTrendChart({ title, bars }) {
  if (!bars.length) return null;
  const data = bars.map((b) => ({ name: b.label, value: b.rawValue, trend: b.trend }));
  const interval = Math.max(0, Math.floor(data.length / 12) - 1);

  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-5">
      <h2 className="text-sm font-medium text-gray-300 mb-4 text-right">{title}</h2>
      <div className="h-52 sm:h-64" role="img" aria-label={`תרשים מגמה יומי: ${title}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2020" vertical={false} />
            <XAxis
              dataKey="name"
              interval={interval}
              tick={<DateXTick />}
              axisLine={false}
              tickLine={false}
              height={28}
            />
            <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
              cursor={{ fill: 'rgba(232,93,4,0.1)' }}
              labelFormatter={(v) => String(v).length >= 7 ? String(v).slice(5) : v}
              formatter={(v, name) => [
                v.toLocaleString('he-IL'),
                name === 'trend' ? 'ממוצע נע' : 'אזעקות',
              ]}
            />
            <Bar dataKey="value" fill="#e85d04" radius={[3, 3, 0, 0]} />
            <Line
              type="monotone"
              dataKey="trend"
              stroke="#f48c06"
              strokeWidth={2.5}
              dot={false}
              strokeLinejoin="round"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function ChartGrid({ items }) {
  if (!items || !items.length) return null;

  // Single item — full width
  if (items.length === 1) {
    const item = items[0];
    if (!item.bars.length) return null;
    if (item.type === 'Daily Trend') {
      return <DailyTrendChart title={item.title} bars={item.bars} />;
    }
    return <BarChartCard title={item.title} bars={item.bars} compact />;
  }

  // Two items side by side
  return (
    <>
      {items.map((item) => {
        if (!item.bars.length) return null;
        if (item.type === 'Daily Trend') {
          return <DailyTrendChart key={item.title} title={item.title} bars={item.bars} />;
        }
        if (item.type === 'Donut / Breakdown') {
          return <DonutChart key={item.title} title={item.title} bars={item.bars} />;
        }
        return <BarChartCard key={item.title} title={item.title} bars={item.bars} />;
      })}
    </>
  );
}
