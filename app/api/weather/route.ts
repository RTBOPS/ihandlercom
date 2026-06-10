import { NextRequest, NextResponse } from 'next/server';

// Server-side proxy for NOAA Aviation Weather — avoids browser CORS
// GET /api/weather?icao=MMUN
export async function GET(req: NextRequest) {
  const icao = new URL(req.url).searchParams.get('icao')?.toUpperCase().trim();
  if (!icao) return NextResponse.json({ error: 'No ICAO' }, { status: 400 });

  const base = 'https://aviationweather.gov/api/data';

  try {
    const [metarRes, tafRes] = await Promise.all([
      fetch(`${base}/metar?ids=${icao}&format=json`, { next: { revalidate: 1200 } }),
      fetch(`${base}/taf?ids=${icao}&format=json`,   { next: { revalidate: 1200 } }),
    ]);

    const [metarData, tafData] = await Promise.all([
      metarRes.json(),
      tafRes.json(),
    ]);

    const metar: string = metarData?.[0]?.rawOb  ?? '';
    const taf:   string = tafData?.[0]?.rawTAF   ?? '';

    return NextResponse.json({ metar, taf });
  } catch (err) {
    console.error('Weather proxy error:', err);
    return NextResponse.json({ error: 'Weather fetch failed' }, { status: 500 });
  }
}
