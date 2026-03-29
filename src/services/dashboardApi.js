const publishedSheets = {
  alerts:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vS07nD5ZpHdthbwCyVsg6UEpkUxPFqIap5y4w9NuW8zMcGwI5d1AI6_cFRTMHmAtWq6Sl4qiEm8o47x/pub?gid=830481549&single=true&output=csv',
  dashboard:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vS07nD5ZpHdthbwCyVsg6UEpkUxPFqIap5y4w9NuW8zMcGwI5d1AI6_cFRTMHmAtWq6Sl4qiEm8o47x/pub?gid=992571999&single=true&output=csv',
};

const fallbackSnapshots = {
  alerts: '/data/alerts_clean.json',
  dashboard: '/data/dashboard_events.json',
};

export async function fetchDashboardSnapshot() {
  try {
    const [alertsCsv, dashboardCsv] = await Promise.all([
      fetchCsvRows(publishedSheets.alerts),
      fetchCsvRows(publishedSheets.dashboard),
    ]);

    return {
      alerts: alertsCsv,
      dashboardEvents: dashboardCsv,
      source: 'published_csv',
    };
  } catch (error) {
    const [alerts, dashboardEvents] = await Promise.all([
      fetchJsonRows(fallbackSnapshots.alerts, 'alerts snapshot'),
      fetchJsonRows(fallbackSnapshots.dashboard, 'dashboard snapshot'),
    ]);

    return {
      alerts,
      dashboardEvents,
      source: 'local_snapshot',
      fallbackReason: error.message || 'Failed to load published CSV',
    };
  }
}

async function fetchCsvRows(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load CSV: ${response.status}`);
  }

  const csvText = await response.text();
  return parseCsv(csvText);
}

async function fetchJsonRows(url, label) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${label}: ${response.status}`);
  }

  return response.json();
}

function parseCsv(input) {
  const rows = [];
  let currentCell = '';
  let currentRow = [];
  let insideQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentCell = '';
      currentRow = [];
      continue;
    }

    currentCell += char;
  }

  if (currentCell || currentRow.length) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  if (!rows.length) return [];

  const [header, ...body] = rows;
  return body
    .filter((row) => row.some((value) => value !== ''))
    .map((row) => toObjectRow(header, row));
}

function toObjectRow(header, row) {
  return header.reduce((record, key, index) => {
    record[key] = row[index] ?? '';
    return record;
  }, {});
}
