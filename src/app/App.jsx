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
        [builderState.cut1, builderState.cut2],
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

  return (
    <div className="min-h-screen bg-bg px-3 py-4 sm:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">שאגת האריה 2.0</h1>
          <p className="text-muted text-sm mt-1">דשבורד אזעקות · פילוח דינמי · נתוני פיקוד העורף</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span>
            {filteredAlerts.length.toLocaleString('he-IL')} שורות
            {activeFilters.length ? ` · ${activeFilters.join(' | ')}` : ''}
          </span>
        </div>
      </header>

      <main>
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 text-red-300 text-sm">
            שגיאה בטעינת נתונים: {error}
          </div>
        )}

        <div className="mb-6">
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            options={filterOptions}
            availableMunicipalities={availableMunicipalities}
            availableSettlements={availableSettlements}
          />
        </div>

        {isLoading && (
          <div className="text-center text-muted py-20 text-sm">טוען נתונים...</div>
        )}

        {!isLoading && !error && (
          <>
            <KpiGrid items={kpis} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <ChartGrid items={charts.slice(0, 2)} />
            </div>

            <div className="mb-4">
              <ChartGrid items={charts.slice(2)} />
            </div>

            <CustomCutBuilder
              dimensions={customCutDimensions}
              metrics={customCutMetrics}
              topNOptions={topNOptions}
              builderState={builderState}
              previewRows={customCutRows}
              onChange={handleBuilderChange}
              onReset={handleBuilderReset}
            />

            <TopTenTable rows={topTenRows} />
          </>
        )}
      </main>

      <footer className="mt-8 pt-6 border-t border-border text-center text-xs text-muted space-y-1">
        <p>האתר מציג נתונים רשמיים של פיקוד העורף. הנתונים מוצגים כפי שהתקבלו — אין אחריות לנכונותם.</p>
        <p>
          ליצירת קשר:{' '}
          <a href="mailto:meimagineai@gmail.com" className="hover:text-white underline transition-colors">
            MEIMAGINEAI
          </a>
        </p>
      </footer>

      {toast && (
        <div className="fixed left-4 bottom-4 z-20 bg-[#1a1010] border border-border text-sm text-white rounded-xl px-4 py-3 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
