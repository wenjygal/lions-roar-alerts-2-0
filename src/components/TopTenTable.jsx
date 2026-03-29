export default function TopTenTable({ rows }) {
  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <p className="eyebrow">Top 10</p>
          <h2>טבלת ההשוואה המרכזית</h2>
        </div>
      </div>

      {rows.length ? (
        <table className="top-table">
          <thead>
            <tr>
              <th>#</th>
              <th>קבוצה</th>
              <th>מספר אזעקות</th>
              <th>הופעות ביישובים</th>
              <th>יישובים ייחודיים</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.label}>
                <td>{index + 1}</td>
                <td>{row.label}</td>
                <td>{row.displayValue}</td>
                <td>{row.appearances}</td>
                <td>{row.uniqueSettlements}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <strong>אין תוצאות ל־Top 10 בסינון הנוכחי</strong>
          <span>ברגע שיחזרו תוצאות, הטבלה המרכזית תופיע כאן.</span>
        </div>
      )}
    </section>
  );
}
