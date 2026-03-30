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

const QUICK_FILTERS = [
  { label: 'היום', days: 0 },
  { label: '7 ימים', days: 7 },
  { label: '28 ימים', days: 28 },
  { label: 'הכל', days: null },
];

function toISODate(d) {
  return d.toISOString().split('T')[0];
}

function getQuickRange(days) {
  const today = new Date();
  const toDate = toISODate(today);
  if (days === null) return { fromDate: '', toDate: '' };
  if (days === 0) return { fromDate: toDate, toDate };
  const from = new Date(today);
  from.setDate(from.getDate() - days);
  return { fromDate: toISODate(from), toDate };
}

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

  function applyQuickFilter(days) {
    const range = getQuickRange(days);
    setFilters((current) => ({ ...current, fromDate: range.fromDate, toDate: range.toDate }));
  }

  const activeQuick = useMemo(() => {
    const match = QUICK_FILTERS.find(({ days }) => {
      const range = getQuickRange(days);
      return filters.fromDate === range.fromDate && filters.toDate === range.toDate;
    });
    return match ? match.label : null;
  }, [filters.fromDate, filters.toDate]);

  function handleBuilderReset() {
    setBuilderState(initialBuilderState);
    showToast('הניתוח המותאם אופס לברירת המחדל');
  }

  return (
    <div className="min-h-screen bg-bg px-3 py-4 sm:p-6 max-w-7xl mx-auto">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-50 focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm"
      >
        דלג לתוכן הראשי
      </a>

      {/* Header */}
      <header className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4 flex items-center gap-5">
        <div className="flex-1 text-right">
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">שאגת האריה 2.0</h1>
          <p className="text-accent text-sm sm:text-base font-semibold mt-2">סטטיסטיקת אזעקות מתעדכנת</p>
          <p className="text-muted text-xs mt-1">סיכום אזעקות וניתוח סטטיסטי</p>
          <p className="text-muted text-xs mt-0.5">הנתונים כוללים אזעקות צבע אדום בלבד ממערכת פיקוד העורף. הנתונים מוצגים כפי שהתקבלו — אין אחריות לנכונותם.</p>
        </div>
        <img
          src="./og-lion-facepalm.png"
          alt="לוגו שאגת האריה"
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl object-cover flex-shrink-0"
        />
      </header>

      {/* Quick date filters */}
      <div className="flex gap-2 mb-4 justify-end flex-wrap">
        {QUICK_FILTERS.map(({ label, days }) => {
          const isActive = activeQuick === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => applyQuickFilter(days)}
              aria-pressed={isActive}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                isActive
                  ? 'bg-accent text-white'
                  : 'bg-card border border-border text-muted hover:text-white hover:border-muted'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <main id="main-content">
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
        <p>
          ליצירת קשר:{' '}
          <a href="mailto:meimagineai@gmail.com" className="hover:text-white underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
            MEIMAGINEAI
          </a>
          {' · '}
          <a href="/lions-roar-alerts-2-0/accessibility.html" className="hover:text-white underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
            הצהרת נגישות
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
