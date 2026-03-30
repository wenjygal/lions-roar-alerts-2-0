const EMOJI = ['🦁', '🚀', '📊', '⏰', '🗺️', '🔥', '💤', '📍', '⚡', '🌙'];

function buildFacts(alerts) {
  if (!alerts.length) return [];

  const facts = [];

  const total = new Set(alerts.map((r) => r.event_key).filter(Boolean)).size;

  // By hour
  const byHour = {};
  for (const r of alerts) {
    const h = String(r.event_time_local || '').slice(0, 2);
    if (h) byHour[h] = (byHour[h] || 0) + 1;
  }
  const hourEntries = Object.entries(byHour).sort((a, b) => b[1] - a[1]);
  const topHour = hourEntries[0];
  const quietHour = hourEntries[hourEntries.length - 1];

  // By settlement
  const bySettlement = {};
  for (const r of alerts) {
    const s = r.normalized_settlement || r.source_settlement_raw;
    if (s && s !== 'לא ממופה') bySettlement[s] = (bySettlement[s] || 0) + 1;
  }
  const topSettlement = Object.entries(bySettlement).sort((a, b) => b[1] - a[1])[0];
  const uniqueSettlements = Object.keys(bySettlement).length;

  // By region
  const byRegion = {};
  for (const r of alerts) {
    const reg = r.region;
    if (reg && !reg.includes('?') && reg !== 'לא ממופה') byRegion[reg] = (byRegion[reg] || 0) + 1;
  }
  const topRegion = Object.entries(byRegion).sort((a, b) => b[1] - a[1])[0];

  // First / last
  const times = alerts.map((r) => r.event_time_local).filter(Boolean).sort();
  const firstAlert = times[0]?.slice(0, 5);
  const lastAlert = times[times.length - 1]?.slice(0, 5);

  // --- Witty fact templates ---

  if (total > 0) {
    facts.push(`אתמול השמיעו ${total.toLocaleString('he-IL')} אזעקות. יותר מהממוצע של הודעות שיווק שמקבלים ביום.`);
  }

  if (topHour) {
    facts.push(`${topHour[0]}:00–${topHour[0]}:59 הייתה שעת השיא אתמול — ${topHour[1].toLocaleString('he-IL')} התראות. ממליצים לתכנן את הקפה לשעה אחרת.`);
  }

  if (quietHour && quietHour[0] !== topHour?.[0]) {
    facts.push(`${quietHour[0]}:00 הייתה השקטה ביותר אתמול עם ${quietHour[1]} התראות בלבד. חלון הזדמנויות מצוין למקלחת.`);
  }

  if (topSettlement) {
    facts.push(`${topSettlement[0]} זכתה אתמול בתואר "היעד המועדף" — ${topSettlement[1].toLocaleString('he-IL')} ביקורים לא מוזמנים.`);
  }

  if (topRegion) {
    const pct = Math.round((topRegion[1] / alerts.length) * 100);
    facts.push(`${pct}% מהאזעקות אתמול היו ב${topRegion[0]}. התושבים כבר מתחילים להרגיש מיוחדים.`);
  }

  if (uniqueSettlements > 0) {
    facts.push(`אתמול ה"שירות" הגיע ל-${uniqueSettlements.toLocaleString('he-IL')} ישובים שונים. כיסוי מרשים, לצערנו.`);
  }

  if (firstAlert && lastAlert) {
    if (firstAlert < '06:00') {
      facts.push(`האזעקה הראשונה אתמול הייתה ב-${firstAlert}. כן, לפני שתיית הקפה הראשונה.`);
    } else {
      facts.push(`האזעקה הראשונה אתמול ב-${firstAlert}, האחרונה ב-${lastAlert}. יום עמוס.`);
    }
  }

  if (lastAlert && lastAlert > '22:00') {
    facts.push(`האזעקה האחרונה אתמול הייתה ב-${lastAlert}. גם מי שהלך לישון מוקדם לא פספס כלום.`);
  }

  if (total > 0 && Object.keys(byHour).length > 0) {
    const activeHours = Object.keys(byHour).length;
    const perHour = Math.round(total / activeHours);
    if (perHour >= 5) {
      facts.push(`בממוצע ${perHour} אזעקות לשעה אתמול. קצב עבודה שגם אמאזון היה מתגאה בו.`);
    }
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
