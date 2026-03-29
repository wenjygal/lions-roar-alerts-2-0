export default function CustomCutBuilder({
  dimensions,
  metrics,
  topNOptions,
  builderState,
  previewRows,
  onChange,
  onReset,
  onAddLevel,
}) {
  const { cut1, cut2, cut3, metric, topN } = builderState;
  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <p className="eyebrow">Custom Cut Builder</p>
          <h2>ניתוח מותאם אישית</h2>
          <p className="panel__subcopy">
            בחרו איך לקבץ את הנתונים ולראות חתך מותאם אישית על בסיס הסינון הנוכחי.
          </p>
        </div>
      </div>

      <p className="builder-note">הניתוח המותאם פועל על הנתונים שכבר סוננו למעלה.</p>

      <div className="builder-grid">
        <BuilderSelect label="קבץ לפי רמה 1" value={cut1} options={dimensions} onChange={(value) => onChange('cut1', value)} />
        <BuilderSelect label="קבץ לפי רמה 2" value={cut2} options={['', ...dimensions]} onChange={(value) => onChange('cut2', value)} />
        <BuilderSelect label="קבץ לפי רמה 3" value={cut3} options={['', ...dimensions]} onChange={(value) => onChange('cut3', value)} />
        <BuilderSelect label="מדד" value={metric} options={metrics} onChange={(value) => onChange('metric', value)} />
        <BuilderSelect label="Top N" value={topN} options={topNOptions} onChange={(value) => onChange('topN', value)} />
      </div>

      <div className="builder-actions">
        <button className="primary-button" type="button" onClick={onAddLevel}>
          הוסף רמת חיתוך
        </button>
        <button className="ghost-button" type="button" onClick={onReset}>
          נקה builder
        </button>
      </div>

      <div className="builder-preview">
        <div className="builder-preview__chart">
          <div className="panel__head">
            <h3>תצוגת גרף</h3>
            <span className="metric-tag">
              {cut1}
              {cut2 ? ` > ${cut2}` : ''}
              {cut3 ? ` > ${cut3}` : ''}
            </span>
          </div>
          {previewRows.length ? (
            <div className="stacked-bars" aria-hidden="true">
              {previewRows.slice(0, 6).map((row, index) => (
                <div className="stacked-bars__row" key={row.label}>
                  <span>{row.label}</span>
                  <div className="stacked-bars__track">
                    <div
                      className={`stacked-bars__fill stacked-bars__fill--${(index % 4) + 1}`}
                      style={{ width: `${row.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>אין תוצאות לחיתוך שבחרת</strong>
              <span>נסו להסיר פילטר או לבחור רמות חיתוך אחרות.</span>
            </div>
          )}
        </div>

        <div className="builder-preview__table">
          <div className="panel__head">
            <h3>תצוגת טבלה</h3>
            <span className="metric-tag">{metric}</span>
          </div>
          {previewRows.length ? (
            <table>
              <thead>
                <tr>
                  <th>קבוצה</th>
                  <th>ערך</th>
                  <th>מגמה</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.slice(0, 6).map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.displayValue}</td>
                    <td>{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <strong>כרגע אין טבלה להצגה</strong>
              <span>הנתונים יופיעו כאן ברגע שהחיתוך יחזיר תוצאות.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BuilderSelect({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option || 'empty'} value={option}>
            {option || 'ללא'}
          </option>
        ))}
      </select>
    </label>
  );
}
