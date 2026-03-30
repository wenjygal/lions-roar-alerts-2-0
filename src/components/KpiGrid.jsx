const CARD_COLORS = [
  'bg-[#1f0a0a] border-[#3a1010]',
  'bg-[#1a1a08] border-[#2a2a10]',
  'bg-[#1a0a12] border-[#3a1020]',
  'bg-[#0a1a1a] border-[#103a3a]',
];

export default function KpiGrid({ items }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`rounded-xl border p-4 sm:p-5 flex flex-col gap-2 ${CARD_COLORS[i % CARD_COLORS.length]}`}
        >
          <span className="text-xs sm:text-sm text-muted">{item.label}</span>
          <div className="text-xl sm:text-2xl font-bold text-white leading-tight">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
