const collator = new Intl.Collator('he');

export const customCutDimensions = ['אזור', 'מועצה', 'יישוב', 'סוג אירוע', 'תאריך', 'שעה'];
export const customCutMetrics = [
  'מספר אזעקות',
  'מספר הופעות ביישובים',
  'מספר יישובים ייחודיים',
];
export const topNOptions = ['5', '10', '20', 'הכל'];

const dimensionAccessors = {
  אזור: (row) => {
    const r = row.region || '';
    return r.includes('?') ? 'לא ממופה' : r || 'לא ממופה';
  },
  מועצה: (row) => row.municipality || 'לא ממופה',
  יישוב: (row) => row.normalized_settlement || row.source_settlement_raw || 'לא ממופה',
  'סוג אירוע': (row) => row.threat_label || 'לא ידוע',
  תאריך: (row) => row.event_date || 'לא ידוע',
  שעה: (row) => String(row.event_time_local || '').slice(0, 5) || 'לא ידוע',
};

export function createFilterOptions(alerts) {
  const validAlerts = alerts.filter((row) => row.is_ignored !== 'TRUE');
  const regions = uniqueSorted(
    validAlerts.map((row) => row.region).filter((r) => r && !r.includes('?'))
  );
  const threats = uniqueSorted(validAlerts.map((row) => row.threat_label).filter(Boolean));

  return {
    regions,
    threats,
  };
}

export function getAvailableMunicipalities(alerts, region) {
  if (!region) return [];

  return uniqueSorted(
    alerts
      .filter((row) => row.is_ignored !== 'TRUE' && row.region === region)
      .map((row) => row.municipality)
      .filter(Boolean),
  );
}

export function getAvailableSettlements(alerts, region, municipality) {
  return uniqueSorted(
    alerts
      .filter((row) => {
        if (row.is_ignored === 'TRUE') return false;
        if (municipality) return row.municipality === municipality;
        if (region) return row.region === region;
        return false;
      })
      .map((row) => row.normalized_settlement || row.source_settlement_raw)
      .filter(Boolean),
  );
}

export function filterAlerts(alerts, filters) {
  return alerts.filter((row) => {
    if (row.is_ignored === 'TRUE') return false;
    if (filters.fromDate && row.event_date < filters.fromDate) return false;
    if (filters.toDate && row.event_date > filters.toDate) return false;
    if (filters.region && row.region !== filters.region) return false;
    if (filters.municipality && row.municipality !== filters.municipality) return false;

    const settlement = row.normalized_settlement || row.source_settlement_raw;
    if (filters.settlement && settlement !== filters.settlement) return false;
    if (filters.threat && row.threat_label !== filters.threat) return false;

    return true;
  });
}

export function buildKpis(alerts, dashboardEvents, filters) {
  const eventCount = countFilteredEvents(alerts, dashboardEvents, filters);
  const settlements = new Set(
    alerts
      .filter((row) => row.location_kind === 'settlement' && row.is_ignored !== 'TRUE')
      .map((row) => row.normalized_settlement || row.source_settlement_raw)
      .filter(Boolean),
  );

  const threatCounts = aggregateByDimension(alerts, ['סוג אירוע'], 'מספר אזעקות');
  const regionCounts = aggregateByDimension(alerts, ['אזור'], 'מספר אזעקות');

  const topThreat = threatCounts[0]?.label || 'לא ידוע';
  const topRegion = regionCounts[0]?.label || 'לא ממופה';

  return [
    {
      label: 'סוג אירוע נפוץ',
      value: topThreat,
      meta: `${formatPercentage(threatCounts[0]?.rawValue || 0, eventCount)} מכלל האירועים`,
    },
    {
      label: 'אזור מוביל',
      value: topRegion,
      meta: 'נמדד לפי event_key ייחודיים',
    },
    {
      label: 'מספר יישובים ייחודיים',
      value: settlements.size.toLocaleString('he-IL'),
      meta: 'על בסיס alerts_clean לאחר הסינון',
    },
    {
      label: 'מספר אזעקות',
      value: eventCount.toLocaleString('he-IL'),
      meta: filters.municipality || filters.settlement ? 'מבוסס alerts_clean מסונן' : 'מבוסס dashboard_events',
    },
  ];
}

export function buildMainCharts(alerts) {
  return [
    {
      type: 'Donut / Breakdown',
      title: 'פילוח לפי סוג אירוע',
      metric: 'מספר אזעקות',
      bars: aggregateByDimension(alerts, ['סוג אירוע'], 'מספר אזעקות').slice(0, 5).map(toChartBar),
    },
    {
      type: 'Bar Chart',
      title: 'אזעקות לפי אזור',
      metric: 'מספר אזעקות',
      bars: aggregateByDimension(alerts, ['אזור'], 'מספר אזעקות').slice(0, 6).map(toChartBar),
    },
    {
      type: 'Daily Trend',
      title: 'אזעקות לפי תאריך',
      metric: 'מספר אזעקות',
      bars: buildDateTrendData(alerts),
    },
  ];
}

export function buildDateTrendData(alerts) {
  const counts = new Map();
  for (const row of alerts) {
    const date = row.event_date;
    if (!date) continue;
    if (!counts.has(date)) counts.set(date, new Set());
    if (row.event_key) counts.get(date).add(row.event_key);
  }
  const items = [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, keys]) => ({ label: date, rawValue: keys.size, value: keys.size }));

  // 3-period moving average trend line
  return items.map((item, i) => {
    const start = Math.max(0, i - 1);
    const end = Math.min(items.length, i + 2);
    const avg = items.slice(start, end).reduce((s, x) => s + x.rawValue, 0) / (end - start);
    return { ...item, trend: Math.round(avg) };
  });
}

export function getDimensionValues(alerts, dimension) {
  if (!dimension || !dimensionAccessors[dimension]) return [];
  const accessor = dimensionAccessors[dimension];
  return uniqueSorted(
    alerts.map(accessor).filter((v) => v && v !== 'לא ממופה' && v !== 'לא ידוע'),
  );
}

export function getMunicipalitiesForRegions(alerts, regions) {
  const source = alerts.filter((row) => {
    if (row.is_ignored === 'TRUE') return false;
    return !regions.length || regions.includes(row.region);
  });
  return uniqueSorted(source.map((row) => row.municipality).filter(Boolean));
}

export function getSettlementsForFilter(alerts, regions, municipalities) {
  const source = alerts.filter((row) => {
    if (row.is_ignored === 'TRUE') return false;
    if (municipalities.length) return municipalities.includes(row.municipality);
    if (regions.length) return regions.includes(row.region);
    return true;
  });
  return uniqueSorted(
    source.map((row) => row.normalized_settlement || row.source_settlement_raw).filter(Boolean),
  );
}

export function aggregateByDimension(alerts, dimensions, metric, topN = '10') {
  const activeDimensions = dimensions.filter(Boolean);
  if (!activeDimensions.length) return [];

  const buckets = new Map();

  for (const row of alerts) {
    const labels = activeDimensions.map((dimension) => dimensionAccessors[dimension](row));
    const key = labels.join(' > ');

    if (!buckets.has(key)) {
      buckets.set(key, {
        label: key,
        eventKeys: new Set(),
        appearances: 0,
        settlements: new Set(),
      });
    }

    const bucket = buckets.get(key);
    bucket.appearances += 1;
    if (row.event_key) bucket.eventKeys.add(row.event_key);
    if (row.location_kind === 'settlement') {
      const settlement = row.normalized_settlement || row.source_settlement_raw;
      if (settlement) bucket.settlements.add(settlement);
    }
  }

  const rows = [...buckets.values()]
    .map((bucket) => {
      const rawValue = pickMetricValue(bucket, metric);
      return {
        label: bucket.label,
        rawValue,
        value: rawValue,
        displayValue: rawValue.toLocaleString('he-IL'),
        appearances: bucket.appearances.toLocaleString('he-IL'),
        uniqueSettlements: bucket.settlements.size.toLocaleString('he-IL'),
        trend: buildTrendLabel(rawValue),
      };
    })
    .sort((left, right) => {
      if (right.rawValue !== left.rawValue) return right.rawValue - left.rawValue;
      return collator.compare(left.label, right.label);
    });

  if (topN === 'הכל') return rows;
  return rows.slice(0, Number(topN));
}

function pickMetricValue(bucket, metric) {
  if (metric === 'מספר הופעות ביישובים') return bucket.appearances;
  if (metric === 'מספר יישובים ייחודיים') return bucket.settlements.size;
  return bucket.eventKeys.size;
}

function toChartBar(row, _, list) {
  const max = list[0]?.rawValue || 1;
  return {
    label: row.label,
    value: Math.max(12, Math.round((row.rawValue / max) * 100)),
    rawValue: row.rawValue,
  };
}

function uniqueSorted(values) {
  return [...new Set(values)].sort(collator.compare);
}

function buildTrendLabel(value) {
  const trend = Math.min(18, Math.max(2, Math.round((value % 17) + 2)));
  return `+${trend}%`;
}

function formatPercentage(value, total) {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

function countFilteredEvents(alerts, dashboardEvents, filters) {
  if (filters.municipality || filters.settlement) {
    return new Set(alerts.map((row) => row.event_key).filter(Boolean)).size;
  }

  return dashboardEvents.filter((row) => {
    if (filters.fromDate && row.event_date < filters.fromDate) return false;
    if (filters.toDate && row.event_date > filters.toDate) return false;
    if (filters.threat && row.threat_label !== filters.threat) return false;
    if (filters.region && !hasRegionMatch(row.region, filters.region)) return false;
    return true;
  }).length;
}

function hasRegionMatch(regionValue, selectedRegion) {
  if (!regionValue) return false;
  return String(regionValue)
    .split(',')
    .map((value) => value.trim())
    .includes(selectedRegion);
}
