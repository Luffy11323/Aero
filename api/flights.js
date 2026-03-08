// api/flights.js - Vercel serverless function

const AVIATION_API_KEY = process.env.AVIATION_API_KEY || "70fcc84c712288d29eef19559cfa8e24";

function classifyAircraft(type) {
  if (!type) return "Unknown";
  if (type.startsWith("C") || type.startsWith("P")) return "Small GA";
  if (type.startsWith("A") || type.startsWith("B")) return "Commercial Jet";
  if (type.startsWith("G") || type.startsWith("CL")) return "Business Jet";
  return "Other";
}

async function fetchFlightPage(baseUrl, offset) {
  const url = `${baseUrl}&offset=${offset}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API responded with status ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    airport = "",
    mode = "arrivals",
    maxRows = "100",
    typeFilter = "",
  } = req.query;

  const airportCode = airport.trim().toUpperCase();
  const flightMode = mode.trim().toLowerCase();
  const limit = Math.min(Math.max(parseInt(maxRows) || 100, 10), 200);
  const filter = typeFilter.trim().toUpperCase();

  if (!airportCode) {
    return res.status(400).json({ error: "Airport code is required." });
  }

  if (!["arrivals", "departures"].includes(flightMode)) {
    return res.status(400).json({ error: "Mode must be 'arrivals' or 'departures'." });
  }

  let baseUrl = `https://api.aviationstack.com/v1/flights?access_key=${AVIATION_API_KEY}&limit=100`;
  if (flightMode === "arrivals") baseUrl += `&arr_iata=${airportCode}`;
  else baseUrl += `&dep_iata=${airportCode}`;

  try {
    let allData = [];
    let offset = 0;

    // Paginate until we have enough data
    while (allData.length < limit) {
      const json = await fetchFlightPage(baseUrl, offset);

      if (!json.data || json.data.length === 0) break;

      allData = allData.concat(json.data);
      if (json.data.length < 100) break;

      offset += 100;

      // Avoid rate-limiting on multiple pages
      if (allData.length < limit) {
        await new Promise((r) => setTimeout(r, 1200));
      }
    }

    // Map and normalize flight data
    const rows = allData.slice(0, limit).map((f) => {
      const aircraftType = f.aircraft?.iata || f.aircraft?.icao || f.aircraft?.registration || "";
      const flightDate = f.arrival?.scheduled
        ? new Date(f.arrival.scheduled).toISOString().split("T")[0]
        : "";

      return {
        flight_ident: f.flight?.iata || f.flight?.icao || "",
        registration: f.aircraft?.registration || "",
        aircraft_type: aircraftType,
        aircraft_class: classifyAircraft(aircraftType),
        operator: f.airline?.name || "",
        origin: f.departure?.iata || "",
        destination: f.arrival?.iata || "",
        flight_date: flightDate,
        scheduled_in: f.arrival?.scheduled || "",
        actual_in: f.arrival?.actual || "",
        scheduled_out: f.departure?.scheduled || "",
        actual_out: f.departure?.actual || "",
        status: f.flight_status || "",
      };
    });

    // Apply aircraft type filter if provided
    const filtered = filter
      ? rows.filter((r) => r.aircraft_type.toUpperCase().includes(filter))
      : rows;

    return res.status(200).json({
      airport: airportCode,
      mode: flightMode,
      total_fetched: allData.length,
      total_returned: filtered.length,
      flights: filtered,
    });
  } catch (err) {
    console.error("Flight fetch error:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch flight data." });
  }
}
