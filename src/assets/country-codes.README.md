Country names and ISO codes in country-codes.json are copied from the app's
countryOptions catalogue in Snows-ProAm-App-Expo54/src/data/institutionLocations.ts.
This keeps flag coverage aligned with every country users can select in the app.
Existing aliases in InsightsDashboard.jsx cover other saved country names.

Flags are image assets from FlagCDN. Provider documentation and image provenance:
https://flagpedia.net/download/api

Names are matched without case, surrounding whitespace or diacritic differences.
An accessible globe icon keeps the layout stable if an image request fails.
