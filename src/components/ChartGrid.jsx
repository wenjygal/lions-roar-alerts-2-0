import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
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

function XTick({ x, y, payload }) {
  const v = String(payload.value);
  const label = v.length > 12 ? v.slice(0, 11) + '…' : v;
  return (
    <g transform={`translate(${x},${y + 8})`}>
      <text transform="rotate(-40)" textAnchor="end" fill="#888" fontSize={10}>
        {label}
      </text>
    </g>
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
      <div className="h-72">
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
      <div className={height}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2020" vertical={false} />
            <XAxis
              dataKey="name"
              interval={0}
              tick={<XTick />}
              axisLine={false}
              tickLine={false}
              height={72}
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

export default function ChartGrid({ items }) {
  if (!items || !items.length) return null;

  // Single item — full width
  if (items.length === 1) {
    const item = items[0];
    if (!item.bars.length) return null;
    return (
      <BarChartCard title={item.title} bars={item.bars} compact />
    );
  }

  // Two items side by side
  return (
    <>
      {items.map((item) => {
        if (!item.bars.length) return null;
        if (item.type === 'Donut / Breakdown') {
          return <DonutChart key={item.title} title={item.title} bars={item.bars} />;
        }
        return <BarChartCard key={item.title} title={item.title} bars={item.bars} />;
      })}
    </>
  );
}
