import { useMemo, useState } from 'react';
import FilterBar from '../components/FilterBar.jsx';
import KpiGrid from '../components/KpiGrid.jsx';
import ChartGrid from '../components/ChartGrid.jsx';
import CustomCutBuilder from '../components/CustomCutBuilder.jsx';
import TopTenTable from '../components/TopTenTable.jsx';
import {
  aggregateByDimension,
  customCutDimensions,
  customCutMetrics,
  topNOptions,
} from '../domain/dashboardSelectors.js';
import { useDashboardData } from '../hooks/useDashboardData.js';

const initialFilters = {
  fromDate: '2026-03-01',
  toDate: '2026-03-29',
  region: '',
  municipality: '',
  settlement: '',
  threat: '',
};

const initialBuilderState = {
  cut1: 'אזור',
  cut2: 'מועצה',
  cut3: '',
  metric: 'מספר אזעקות',
  topN: '10',
};

export default function App() {
  const [filters, setFilters] = useState(initialFilters);
  const [toast, setToast] = useState('');
  const [builderState, setBuilderState] = useState(initialBuilderState);

  const {
    isLoading,
    error,
    source,
    fallbackReason,
    filterOptions,
    availableMunicipalities,
    availableSettlements,
    filteredAlerts,
    kpis,
    charts,
  } = useDashboardData(filters);

  const topTenRows = useMemo(
    () => aggregateByDimension(filteredAlerts, ['אזור'], 'מספר אזעקות', '10'),
    [filteredAlerts],
  );

  const activeFilters = useMemo(
    () =>
      [
        filters.region ? `אזור: ${filters.region}` : '',
        filters.municipality ? `מועצה: ${filters.municipality}` : '',
        filters.settlement ? `יישוב: ${filters.settlement}` : '',
        filters.threat ? `איום: ${filters.threat}` : '',
      ].filter(Boolean),
    [filters],
  );

  const customCutRows = useMemo(
    () =>
      aggregateByDimension(
        filteredAlerts,
        [builderState.cut1, builderState.cut2, builderState.cut3],
        builderState.metric,
        builderState.topN,
      ),
    [builderState, filteredAlerts],
  );

  function showToast(message) {
    setToast(message);
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(''), 2400);
  }

  function handleFilterChange(field, value) {
    setFilters((current) => {
      if (field === 'region') {
        const next = { ...current, region: value, municipality: '', settlement: '' };
        if (current.region && current.region !== value) {
          showToast('המועצה והיישוב אופסו בהתאם לאזור החדש');
        }
        return next;
      }

      if (field === 'municipality') {
        const next = { ...current, municipality: value, settlement: '' };
        if (current.municipality && current.municipality !== value) {
          showToast('היישוב אופס בהתאם למועצה החדשה');
        }
        return next;
      }

      return { ...current, [field]: value };
    });
  }

  function handleResetFilters() {
    setFilters(initialFilters);
  }

  function handleBuilderChange(field, value) {
    setBuilderState((current) => ({ ...current, [field]: value }));
  }

  function handleBuilderReset() {
    setBuilderState(initialBuilderState);
    showToast('הניתוח המותאם אופס לברירת המחדל');
  }

  function handleBuilderAddLevel() {
    setBuilderState((current) => {
      if (!current.cut2) {
        return { ...current, cut2: 'מועצה' };
      }

      if (!current.cut3) {
        return { ...current, cut3: 'יישוב' };
      }

      showToast('כבר הוגדרו 3 רמות חיתוך');
      return current;
    });
  }

  return (
    <div className="shell">
      <div className="shell__backdrop" />
      <main className="dashboard">
        <header className="hero">
          <div>
            <p className="eyebrow">Lions Roar Alerts 2.0</p>
            <h1>דשבורד אזעקות חדש עם פילוחים דינמיים למשתמש</h1>
            <p className="hero__copy">
              מבוסס על לוגיקת אירועים אחידה, פילטרים היררכיים ויכולת להרכיב חיתוכים מורכבים בלי
              להפוך את המסך לכלי BI כבד.
            </p>
          </div>
          <div className="hero__badge">
            <span>מקור אמת</span>
            <strong>alerts_clean + dashboard_events</strong>
          </div>
        </header>

        <section className="panel panel--hint">
          <p className="panel__hint">
            הפילטרים תלויים זה בזה: אזור מצמצם את רשימת המועצות והיישובים, ומועצה מצמצמת את
            רשימת היישובים.
          </p>
          {!isLoading && !error ? (
            <p className="panel__hint panel__hint--status">
              מקור דאטה: <strong>{source === 'published_csv' ? 'Google Sheets live CSV' : 'Local snapshot fallback'}</strong>
              {fallbackReason ? ` | סיבת fallback: ${fallbackReason}` : ''}
            </p>
          ) : null}
        </section>

        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          options={filterOptions}
          availableMunicipalities={availableMunicipalities}
          availableSettlements={availableSettlements}
        />

        {isLoading ? <section className="panel">טוען snapshot חי...</section> : null}
        {error ? <section className="panel">שגיאה בטעינת הנתונים: {error}</section> : null}

        {!isLoading && !error ? (
          <section className="summary-strip">
            <article className="summary-pill">
              <span>שורות פעילות</span>
              <strong>{filteredAlerts.length.toLocaleString('he-IL')}</strong>
            </article>
            <article className="summary-pill">
              <span>פילטרים פעילים</span>
              <strong>{activeFilters.length || '0'}</strong>
            </article>
            <article className="summary-pill summary-pill--wide">
              <span>מצב סינון</span>
              <strong>{activeFilters.length ? activeFilters.join(' | ') : 'ללא פילטרים נוספים, כל טווח התאריכים מוצג'}</strong>
            </article>
          </section>
        ) : null}

        {!isLoading && !error ? <KpiGrid items={kpis} /> : null}

        {!isLoading && !error ? <ChartGrid items={charts} /> : null}

        {!isLoading && !error ? (
          <CustomCutBuilder
            dimensions={customCutDimensions}
            metrics={customCutMetrics}
            topNOptions={topNOptions}
            builderState={builderState}
            previewRows={customCutRows}
            onChange={handleBuilderChange}
            onReset={handleBuilderReset}
            onAddLevel={handleBuilderAddLevel}
          />
        ) : null}

        {!isLoading && !error ? <TopTenTable rows={topTenRows} /> : null}
      </main>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
