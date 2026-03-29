export const globalFilterOptions = {
  regions: ['גוש דן', 'גליל מערבי', 'גליל עליון', 'נגב', 'ירושלים', 'שפלה', 'שרון'],
  threats: ['כל סוגי האירוע', 'ירי רקטות וטילים', 'חדירת כלי טיס עוין'],
  municipalities: {
    'גוש דן': ['תל אביב-יפו', 'ראשון לציון', 'שדות דן'],
    'גליל מערבי': ['מטה אשר', 'מעלה יוסף', 'עכו'],
    'גליל עליון': ['מבואות החרמון', 'הגליל העליון', 'מרום הגליל'],
    נגב: ['באר שבע', 'בני שמעון', 'רמת נגב'],
    ירושלים: ['ירושלים', 'מבשרת ציון', 'קריית יערים'],
    שפלה: ['מטה יהודה', 'ברנר', 'חבל מודיעין'],
    שרון: ['דרום השרון', 'עמק חפר', 'פרדסיה'],
  },
  settlementsByMunicipality: {
    'תל אביב-יפו': ['תל אביב - מרכז העיר', 'תל אביב - עבר הירקון'],
    'מטה אשר': ['נהריה', 'מזרעה'],
    'מבואות החרמון': ['קריית שמונה', 'רמת טראמפ'],
    'באר שבע': ['באר שבע - דרום', 'באר שבע - צפון'],
    ירושלים: ['אבו גוש', 'קריית יערים'],
    'מטה יהודה': ['שורש', 'אשתאול'],
    'דרום השרון': ['נווה ירק', 'גני עם'],
  },
  settlementsByRegion: {
    'גוש דן': ['תל אביב - מרכז העיר', 'ראשון לציון', 'שוהם'],
    'גליל מערבי': ['נהריה', 'מזרעה', 'שלומי'],
    'גליל עליון': ['קריית שמונה', 'חצור הגלילית', 'ראש פינה'],
    נגב: ['באר שבע', 'מיתר', 'עומר'],
    ירושלים: ['ירושלים', 'אבו גוש', 'מבשרת ציון'],
    שפלה: ['רחובות', 'יבנה', 'רמלה'],
    שרון: ['דרום השרון', 'פרדסיה', 'נורדיה'],
  },
};

export const dashboardKpis = [
  { label: 'סוג אירוע נפוץ', value: 'ירי רקטות וטילים', meta: '67% מכלל האירועים בטווח הנבחר' },
  { label: 'אזור מוביל', value: 'שפלה', meta: 'נמדד לפי מספר event_key ייחודיים' },
  { label: 'מספר יישובים ייחודיים', value: '214', meta: 'על בסיס alerts_clean לאחר הסינון' },
  { label: 'מספר אזעקות', value: '1,482', meta: 'ספירת event_key ייחודיים' },
];

export const dashboardCharts = [
  {
    type: 'Donut / Breakdown',
    title: 'פילוח לפי סוג אירוע',
    metric: 'מספר אזעקות',
    bars: [
      { label: 'רקטות', value: 88 },
      { label: 'כטב"ם', value: 36 },
      { label: 'אחר', value: 12 },
    ],
  },
  {
    type: 'Bar Chart',
    title: 'אזעקות לפי אזור',
    metric: 'מספר אזעקות',
    bars: [
      { label: 'שפלה', value: 92 },
      { label: 'גליל', value: 78 },
      { label: 'נגב', value: 64 },
      { label: 'שרון', value: 43 },
      { label: 'ירושלים', value: 28 },
    ],
  },
  {
    type: 'Daily Trend',
    title: 'מגמה יומית',
    metric: 'מספר אזעקות',
    bars: [
      { label: '25/03', value: 24 },
      { label: '26/03', value: 38 },
      { label: '27/03', value: 57 },
      { label: '28/03', value: 86 },
      { label: '29/03', value: 96 },
    ],
  },
];

export const customCutDimensions = ['אזור', 'מועצה', 'יישוב', 'סוג אירוע', 'תאריך', 'שעה'];

export const customCutMetrics = [
  'מספר אזעקות',
  'מספר הופעות ביישובים',
  'מספר יישובים ייחודיים',
];

export const topTenRows = [
  { label: 'שפלה', value: 100, displayValue: '248', trend: '+14%', appearances: 634, uniqueSettlements: 48 },
  { label: 'גליל מערבי', value: 82, displayValue: '203', trend: '+9%', appearances: 511, uniqueSettlements: 37 },
  { label: 'נגב', value: 74, displayValue: '184', trend: '+6%', appearances: 438, uniqueSettlements: 32 },
  { label: 'גליל עליון', value: 62, displayValue: '153', trend: '+11%', appearances: 361, uniqueSettlements: 28 },
  { label: 'שרון', value: 53, displayValue: '131', trend: '+4%', appearances: 294, uniqueSettlements: 21 },
  { label: 'ירושלים', value: 48, displayValue: '117', trend: '+2%', appearances: 247, uniqueSettlements: 18 },
  { label: 'גוש דן', value: 43, displayValue: '104', trend: '+7%', appearances: 219, uniqueSettlements: 16 },
  { label: 'עמקים', value: 39, displayValue: '96', trend: '+5%', appearances: 196, uniqueSettlements: 14 },
  { label: 'שומרון', value: 36, displayValue: '89', trend: '+3%', appearances: 182, uniqueSettlements: 13 },
  { label: 'עוטף עזה', value: 29, displayValue: '72', trend: '+12%', appearances: 141, uniqueSettlements: 11 },
];
