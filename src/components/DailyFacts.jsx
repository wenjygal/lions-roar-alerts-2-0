import { useState } from 'react';

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

  // --- Witty fact templates (past tense / hindsight) ---

  if (total > 0) {
    facts.push(`אתמול היו ${total.toLocaleString('he-IL')} אזעקות. יותר מהודעות שיווק שקיבלנו באותו יום, בדיעבד.`);
  }

  if (topHour) {
    facts.push(`${topHour[0]}:00–${topHour[0]}:59 הייתה שעת השיא אתמול עם ${topHour[1].toLocaleString('he-IL')} התראות. בדיעבד — לא הייתה זו השעה הטובה ביותר לקפה בחוץ.`);
  }

  if (quietHour && quietHour[0] !== topHour?.[0]) {
    facts.push(`${quietHour[0]}:00 הייתה השעה השקטה ביותר אתמול — ${quietHour[1]} התראות בלבד. בדיעבד, הייתה זו השעה הטובה ביותר להתקלח.`);
  }

  if (topSettlement) {
    facts.push(`${topSettlement[0]} הייתה "היעד המועדף" אתמול — ${topSettlement[1].toLocaleString('he-IL')} ביקורים לא מוזמנים. בדיעבד, היה כדאי להישאר בבית.`);
  }

  if (topRegion) {
    const pct = Math.round((topRegion[1] / alerts.length) * 100);
    facts.push(`${pct}% מהאזעקות אתמול היו ב${topRegion[0]}. בדיעבד, התושבים שם הרגישו מיוחדים במינם.`);
  }

  if (uniqueSettlements > 0) {
    facts.push(`אתמול ה"שירות" הגיע ל-${uniqueSettlements.toLocaleString('he-IL')} ישובים. בדיעבד — כיסוי גיאוגרפי מרשים, לצערנו.`);
  }

  if (firstAlert) {
    if (firstAlert < '06:00') {
      facts.push(`האזעקה הראשונה אתמול הייתה ב-${firstAlert}. בדיעבד — עוד לפני הקפה. קשה.`);
    } else if (firstAlert > '09:00') {
      facts.push(`האזעקה הראשונה אתמול הגיעה רק ב-${firstAlert}. בדיעבד — הבוקר היה שקט יחסית.`);
    }
  }

  if (lastAlert && lastAlert > '22:00') {
    facts.push(`האזעקה האחרונה אתמול הייתה ב-${lastAlert}. בדיעבד — גם מי שהלך לישון מוקדם לא חמק.`);
  }

  if (total > 0 && Object.keys(byHour).length > 0) {
    const activeHours = Object.keys(byHour).length;
    const perHour = Math.round(total / activeHours);
    if (perHour >= 5) {
      facts.push(`בממוצע ${perHour} אזעקות לשעה אתמול. בדיעבד — קצב שאמאזון היה מתגאה בו, אנחנו פחות.`);
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
  const [open, setOpen] = useState(false);

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

  const dateLabel = yesterday.slice(5).split('-').reverse().join('/');

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs text-muted hover:text-white border border-border rounded-lg px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <span>קצת הומור שחור על אתמול</span>
        <span className="text-[10px]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mt-2">
          <h2 className="text-sm font-medium text-gray-300 mb-3">
            בדיעבד — {dateLabel}
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
      )}
    </div>
  );
}
