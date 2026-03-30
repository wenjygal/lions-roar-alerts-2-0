const EMOJI = ['🦁', '🚀', '📊', '⏰', '🗺️', '🔥', '💤', '📍', '⚡', '🌙'];

function buildFacts(alerts) {
  if (!alerts.length) return [];

  const facts = [];

  // Total count
  const total = new Set(alerts.map((r) => r.event_key).filter(Boolean)).size;
  facts.push(`אתמול נרשמו ${total.toLocaleString('he-IL')} אזעקות`);

  // Busiest hour
  const byHour = {};
  for (const r of alerts) {
    const h = String(r.event_time_local || '').slice(0, 2);
    if (h) byHour[h] = (byHour[h] || 0) + 1;
  }
  const topHour = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0];
  if (topHour) {
    facts.push(`שעת השיא אתמול: ${topHour[0]}:00–${topHour[0]}:59 עם ${topHour[1].toLocaleString('he-IL')} התראות`);
  }

  // Quietest hour (only hours that had at least 1 alert, find min)
  const quietHour = Object.entries(byHour).sort((a, b) => a[1] - b[1])[0];
  if (quietHour && quietHour[0] !== topHour?.[0]) {
    facts.push(`השעה השקטה ביותר אתמול: ${quietHour[0]}:00 עם ${quietHour[1]} התראות בלבד`);
  }

  // Top settlement
  const bySettlement = {};
  for (const r of alerts) {
    const s = r.normalized_settlement || r.source_settlement_raw;
    if (s && s !== 'לא ממופה') bySettlement[s] = (bySettlement[s] || 0) + 1;
  }
  const topSettlement = Object.entries(bySettlement).sort((a, b) => b[1] - a[1])[0];
  if (topSettlement) {
    facts.push(`הישוב הכי מופגז אתמול: ${topSettlement[0]} עם ${topSettlement[1].toLocaleString('he-IL')} התראות`);
  }

  // Top region
  const byRegion = {};
  for (const r of alerts) {
    const reg = r.region;
    if (reg && !reg.includes('?') && reg !== 'לא ממופה') byRegion[reg] = (byRegion[reg] || 0) + 1;
  }
  const topRegion = Object.entries(byRegion).sort((a, b) => b[1] - a[1])[0];
  if (topRegion) {
    const pct = Math.round((topRegion[1] / alerts.length) * 100);
    facts.push(`${pct}% מהאזעקות אתמול היו באזור ${topRegion[0]}`);
  }

  // How many unique settlements
  const uniqueSettlements = Object.keys(bySettlement).length;
  if (uniqueSettlements > 0) {
    facts.push(`${uniqueSettlements.toLocaleString('he-IL')} ישובים שונים קיבלו אזעקות אתמול`);
  }

  // First and last alert
  const sorted = alerts
    .map((r) => r.event_time_local)
    .filter(Boolean)
    .sort();
  if (sorted.length >= 2) {
    const first = sorted[0].slice(0, 5);
    const last = sorted[sorted.length - 1].slice(0, 5);
    facts.push(`האזעקה הראשונה אתמול הייתה ב-${first}, האחרונה ב-${last}`);
  }

  // Average alerts per hour (active hours only)
  const activeHours = Object.keys(byHour).length;
  if (activeHours > 0) {
    const avg = Math.round(alerts.length / activeHours);
    facts.push(`בממוצע ${avg.toLocaleString('he-IL')} התראות לשעה אתמול`);
  }

  // Top threat type
  const byThreat = {};
  for (const r of alerts) {
    const t = r.threat_label;
    if (t) byThreat[t] = (byThreat[t] || 0) + 1;
  }
  const topThreat = Object.entries(byThreat).sort((a, b) => b[1] - a[1])[0];
  if (topThreat && Object.keys(byThreat).length > 1) {
    facts.push(`סוג האיום השכיח ביותר אתמול: ${topThreat[0]}`);
  }

  return facts;
}

function dailySeed(dateStr) {
  // deterministic shuffle seed from YYYY-MM-DD
  return dateStr.replace(/-/g, '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function pickFacts(facts, seed, count = 3) {
  if (!facts.length) return [];
  const shuffled = [...facts];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export default function DailyFacts({ alerts }) {
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  const yesterdayAlerts = alerts.filter((r) => r.event_date === yesterday && r.is_ignored !== 'TRUE');

  if (!yesterdayAlerts.length) return null;

  const allFacts = buildFacts(yesterdayAlerts);
  const seed = dailySeed(yesterday);
  const chosen = pickFacts(allFacts, seed, 3);

  if (!chosen.length) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-4">
      <h2 className="text-sm font-medium text-gray-300 mb-3">
        עובדות על אתמול ({yesterday.slice(5).split('-').reverse().join('/')})
      </h2>
      <div className="flex flex-col sm:flex-row gap-3">
        {chosen.map((fact, i) => (
          <div
            key={i}
            className="flex-1 bg-[#1a1010] border border-border/60 rounded-lg px-4 py-3 flex items-start gap-2"
          >
            <span className="text-base leading-none mt-0.5 flex-shrink-0">{EMOJI[(seed + i * 3) % EMOJI.length]}</span>
            <span className="text-xs sm:text-sm text-gray-300 leading-relaxed">{fact}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
