import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardSnapshot } from '../services/dashboardApi.js';
import {
  buildKpis,
  buildMainCharts,
  createFilterOptions,
  filterAlerts,
  getAvailableMunicipalities,
  getAvailableSettlements,
} from '../domain/dashboardSelectors.js';

export function useDashboardData(filters) {
  const [state, setState] = useState({
    alerts: [],
    dashboardEvents: [],
    source: '',
    fallbackReason: '',
    isLoading: true,
    error: '',
  });

  useEffect(() => {
    let active = true;

    fetchDashboardSnapshot()
      .then((snapshot) => {
        if (!active) return;
        setState({
          alerts: snapshot.alerts,
          dashboardEvents: snapshot.dashboardEvents,
          source: snapshot.source || '',
          fallbackReason: snapshot.fallbackReason || '',
          isLoading: false,
          error: '',
        });
      })
      .catch((error) => {
        if (!active) return;
        setState({
          alerts: [],
          dashboardEvents: [],
          source: '',
          fallbackReason: '',
          isLoading: false,
          error: error.message || 'Failed to load dashboard snapshot',
        });
      });

    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => {
    const filterOptions = createFilterOptions(state.alerts);
    const filteredAlerts = filterAlerts(state.alerts, filters);

    return {
      ...state,
      filterOptions,
      availableMunicipalities: getAvailableMunicipalities(state.alerts, filters.region),
      availableSettlements: getAvailableSettlements(state.alerts, filters.region, filters.municipality),
      filteredAlerts,
      kpis: buildKpis(filteredAlerts, state.dashboardEvents, filters),
      charts: buildMainCharts(filteredAlerts),
    };
  }, [filters, state]);
}
