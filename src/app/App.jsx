import { useMemo, useState } from 'react';
import FilterBar from '../components/FilterBar.jsx';
import KpiGrid from '../components/KpiGrid.jsx';
import ChartGrid from '../components/ChartGrid.jsx';
import CustomCutBuilder from '../components/CustomCutBuilder.jsx';
import TopTenTable from '../components/TopTenTable.jsx';
import {
  aggregateByDimension,
  customCutMetrics,
  getDimensionValues,
  getMunicipalitiesForRegions,
  getSettlementsForFilter,
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
  metric: 'מספר אזעקות',
  topN: '10',
  filterRegions: [],
  filterMunicipalities: [],
  filterSettlements: [],
  filterThreats: [],
  filterDates: [],
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

  // --- Custom Cut: available filter options (cascading) ---
  const cutFilterOptions = useMemo(
    () => ({
      regions: getDimensionValues(filteredAlerts, 'אזור'),
      municipalities: getMunicipalitiesForRegions(filteredAlerts, builderState.filterRegions),
      settlements: getSettlementsForFilter(
        filteredAlerts,
        builderState.filterRegions,
        builderState.filterMunicipalities,
      ),
      threats: getDimensionValues(filteredAlerts, 'סוג אירוע'),
      dates: getDimensionValues(filteredAlerts, 'תאריך'),
    }),
    [filteredAlerts, builderState.filterRegions, builderState.filterMunicipalities],
  );

  // --- Custom Cut: base data after dates + threats filter ---
  const cutBaseAlerts = useMemo(
    () =>
      filteredAlerts.filter((row) => {
        if (builderState.filterThreats.length && !builderState.filterThreats.includes(row.threat_label)) return false;
        if (builderState.filterDates.length && !builderState.filterDates.includes(row.event_date)) return false;
        return true;
      }),
    [filteredAlerts, builderState.filterThreats, builderState.filterDates],
  );

  // Region chart
  const regionChartAlerts = useMemo(
    () =>
      builderState.filterRegions.length
        ? cutBaseAlerts.filter((r) => builderState.filterRegions.includes(r.region))
        : cutBaseAlerts,
    [cutBaseAlerts, builderState.filterRegions],
  );

  // Municipality chart
  const municipalityChartAlerts = useMemo(() => {
    if (builderState.filterMunicipalities.length) {
      return cutBaseAlerts.filter((r) => builderState.filterMunicipalities.includes(r.municipality));
    }
    if (builderState.filterRegions.length) {
      return cutBaseAlerts.filter((r) => builderState.filterRegions.includes(r.region));
    }
    return cutBaseAlerts;
  }, [cutBaseAlerts, builderState.filterRegions, builderState.filterMunicipalities]);

  // Settlement chart
  const settlementChartAlerts = useMemo(() => {
    if (builderState.filterSettlements.length) {
      return cutBaseAlerts.filter((r) => {
        const s = r.normalized_settlement || r.source_settlement_raw;
        return builderState.filterSettlements.includes(s);
      });
    }
    if (builderState.filterMunicipalities.length) {
      return cutBaseAlerts.filter((r) => builderState.filterMunicipalities.includes(r.municipality));
    }
    if (builderState.filterRegions.length) {
      return cutBaseAlerts.filter((r) => builderState.filterRegions.includes(r.region));
    }
    return cutBaseAlerts;
  }, [cutBaseAlerts, builderState.filterRegions, builderState.filterMunicipalities, builderState.filterSettlements]);

  const regionRows = useMemo(
    () => aggregateByDimension(regionChartAlerts, ['אזור'], builderState.metric, builderState.topN),
    [regionChartAlerts, builderState.metric, builderState.topN],
  );

  const municipalityRows = useMemo(
    () => aggregateByDimension(municipalityChartAlerts, ['מועצה'], builderState.metric, builderState.topN),
    [municipalityChartAlerts, builderState.metric, builderState.topN],
  );

  const settlementRows = useMemo(
    () => aggregateByDimension(settlementChartAlerts, ['יישוב'], builderState.metric, builderState.topN),
    [settlementChartAlerts, builderState.metric, builderState.topN],
  );

  // --- Handlers ---
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
    setBuilderState((current) => {
      if (field === 'filterRegions') {
        return { ...current, filterRegions: value, filterMunicipalities: [], filterSettlements: [] };
      }
      if (field === 'filterMunicipalities') {
        return { ...current, filterMunicipalities: value, filterSettlements: [] };
      }
      return { ...current, [field]: value };
    });
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
              metrics={customCutMetrics}
              topNOptions={topNOptions}
              builderState={builderState}
              cutFilterOptions={cutFilterOptions}
              regionRows={regionRows}
              municipalityRows={municipalityRows}
              settlementRows={settlementRows}
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
