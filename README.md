# Airport Traffic Analyzer

Converted from Google Apps Script → Vercel Node.js serverless app.

## Structure

```
airport-tracker/
├── api/
│   └── flights.js      # Serverless API route (GET /api/flights)
├── public/
│   └── index.html      # Frontend UI
├── .env.example
├── package.json
└── vercel.json
```

## API

### `GET /api/flights`

| Query Param | Description | Default |
|-------------|-------------|---------|
| `airport`   | IATA airport code (e.g. JFK, LHE) | required |
| `mode`      | `arrivals` or `departures` | `arrivals` |
| `maxRows`   | Number of flights to return (10–200) | `100` |
| `typeFilter`| Filter by aircraft IATA type (e.g. A320, B738) | none |

**Example:**
```
GET /api/flights?airport=JFK&mode=arrivals&maxRows=50
```

**Response:**
```json
{
  "airport": "JFK",
  "mode": "arrivals",
  "total_fetched": 100,
  "total_returned": 50,
  "flights": [
    {
      "flight_ident": "AA123",
      "registration": "N12345",
      "aircraft_type": "A321",
      "aircraft_class": "Commercial Jet",
      "operator": "American Airlines",
      "origin": "LAX",
      "destination": "JFK",
      "flight_date": "2025-01-15",
      "scheduled_in": "2025-01-15T14:30:00+00:00",
      "actual_in": "2025-01-15T14:45:00+00:00",
      "scheduled_out": "2025-01-15T11:00:00+00:00",
      "actual_out": "2025-01-15T11:10:00+00:00",
      "status": "landed"
    }
  ]
}
```

## Deploy

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Set your API key
```bash
vercel env add AVIATION_API_KEY
```
Or set it in the Vercel dashboard under Project → Settings → Environment Variables.

### 3. Deploy
```bash
vercel --prod
```

### Local Development
```bash
npm install
cp .env.example .env.local  # add your API key
vercel dev
```

## Notes
- The API key is kept server-side via env vars — never exposed to the browser.
- Pagination is handled automatically (fetches up to 200 rows across multiple API calls).
- `maxDuration` is set to 30s in `vercel.json` to handle paginated fetches.
