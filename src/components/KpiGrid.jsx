export default function KpiGrid({ items }) {
  return (
    <section className="kpi-grid">
      {items.map((item) => (
        <article className="kpi-card" key={item.label}>
          <p className="kpi-card__label">{item.label}</p>
          <strong className="kpi-card__value">{item.value}</strong>
          <p className="kpi-card__meta">{item.meta}</p>
        </article>
      ))}
    </section>
  );
}
