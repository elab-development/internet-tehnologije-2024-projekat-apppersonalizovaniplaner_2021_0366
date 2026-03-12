const API_URL = 'https://countriesnow.space/api/v0.1/countries/positions';

export async function loadCountries() {
  try {
    const res = await fetch(API_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      console.warn('Countries API returned', res.status);
      throw new Error('Failed to fetch countries');
    }

    const json = await res.json();

    const list = (json.data || [])
      .map((c) => c.name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    if (!list.length) throw new Error('No countries found');
    return list;
  } catch (err) {
    console.error('Failed to load countries:', err);
    // Fallback lista
    return [
      'Serbia',
      'Croatia',
      'Bosnia and Herzegovina',
      'Montenegro',
      'North Macedonia',
      'Slovenia',
      'Hungary',
      'Romania',
      'Bulgaria',
      'Greece',
      'Germany',
      'France',
      'Italy',
      'Spain',
      'United Kingdom',
      'United States',
      'Canada',
    ].sort((a, b) => a.localeCompare(b));
  }
}