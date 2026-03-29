export default function ChartGrid({ items }) {
  return (
    <section className="chart-grid">
      {items.map((item) => (
        <article className="panel chart-card" key={item.title}>
          <div className="panel__head">
            <div>
              <p className="eyebrow">{item.type}</p>
              <h2>{item.title}</h2>
            </div>
            <span className="metric-tag">{item.metric}</span>
          </div>
          {item.bars.length ? (
            <div className="chart-card__plot" aria-hidden="true">
              {item.bars.map((bar) => (
                <div className="chart-bar" key={bar.label}>
                  <div className="chart-bar__track">
                    <div className="chart-bar__fill" style={{ height: `${bar.value}%` }} />
                  </div>
                  <span>{bar.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>אין מספיק נתונים להצגת הגרף</strong>
              <span>נסו להרחיב טווח תאריכים או להסיר אחד מהפילטרים.</span>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
