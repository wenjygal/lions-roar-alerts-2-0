export default function TopTenTable({ rows }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
      <h2 className="text-sm font-medium text-gray-300 mb-4">Top 10 · אזורים מובילים</h2>

      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right pb-3 text-muted font-medium w-8">#</th>
                <th className="text-right pb-3 text-muted font-medium">קבוצה</th>
                <th className="text-right pb-3 text-muted font-medium">אזעקות</th>
                <th className="text-right pb-3 text-muted font-medium hidden sm:table-cell">הופעות</th>
                <th className="text-right pb-3 text-muted font-medium hidden sm:table-cell">יישובים</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.label} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 text-muted">{index + 1}</td>
                  <td className="py-3 text-gray-200 font-medium">{row.label}</td>
                  <td className="py-3 text-accent font-semibold">{row.displayValue}</td>
                  <td className="py-3 text-gray-400 hidden sm:table-cell">{row.appearances}</td>
                  <td className="py-3 text-gray-400 hidden sm:table-cell">{row.uniqueSettlements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted text-sm py-6 text-center">אין תוצאות לסינון הנוכחי</p>
      )}
    </div>
  );
}
