# Lions Roar 2.0

בסיס חדש ונפרד לדשבורד `lions roar alerts 2.0`.

מה יש כרגע:

- Vite + React
- shell ראשי לדשבורד
- Filter Bar היררכי
- KPI cards
- גרפים ראשיים במבנה MVP
- סקשן `ניתוח מותאם אישית`
- טבלת `Top 10`
- טעינה חיה מ־Google Sheets published CSV
- fallback ל־snapshot מקומי אם Google Sheets לא זמין

כדי להתחיל:

```bash
npm install
npm run dev
```

פריסה:

- הריפו מוכן ל־GitHub Pages דרך workflow ב־`.github/workflows/deploy.yml`
- אחרי push ל־`main`, צריך לוודא שב־GitHub Pages מקור הפריסה מוגדר ל־`GitHub Actions`
- ה־site אמור לעלות תחת:
  `https://wenjygal.github.io/lions-roar-alerts-2-0/`

קבצים מרכזיים:

- `src/app/App.jsx`
- `src/components/FilterBar.jsx`
- `src/components/CustomCutBuilder.jsx`
- `src/services/dashboardApi.js`
- `src/domain/dashboardSelectors.js`

מקור הדאטה:

- ברירת המחדל היא טעינה ישירה מ־`alerts_clean` ו־`dashboard_events` דרך Published CSV
- אם הטעינה החיה נכשלת, האפליקציה נופלת אוטומטית ל־`public/data/*.json`
