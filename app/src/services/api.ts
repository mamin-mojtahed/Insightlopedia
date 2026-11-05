import { Figure, Quote } from '../types';

/**
 * Returns candidate URLs for an API endpoint.
 * 1. An explicit environment variable REACT_APP_API_URL (if provided)
 * 2. Relative endpoint path (proxied by CRA Webpack Dev Server on port 3000 to backend)
 * 3. Direct host fallback on port 3001 using the active browser hostname (e.g. 192.168.x.x:3001)
 */
function getApiCandidates(endpoint: string): string[] {
  if (process.env.REACT_APP_API_URL) {
    return [`${process.env.REACT_APP_API_URL}${endpoint}`];
  }

  const candidates: string[] = [];

  // Primary: Relative path — avoids hardcoded localhost and leverages CRA dev proxy
  candidates.push(endpoint);

  // Fallback: Direct connection to port 3001 using the device's accessed hostname
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;
    candidates.push(`${protocol}//${hostname}:3001${endpoint}`);
  } else {
    candidates.push(`http://localhost:3001${endpoint}`);
  }

  return candidates;
}

async function requestJson(endpoint: string): Promise<any> {
  const candidates = getApiCandidates(endpoint);
  let lastError: Error | null = null;

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json'
        }
      });
      if (response.ok) {
        return await response.json();
      }
      lastError = new Error(`Request failed with status ${response.status}: ${response.statusText}`);
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Failed to fetch from ${endpoint}`);
}

export async function fetchQuotes(tag?: string | null): Promise<Quote[]> {
  const endpoint = tag ? `/quotes?tag=${encodeURIComponent(tag)}` : '/quotes';
  const data = await requestJson(endpoint);
  return (data.quotes || []).map((q: any) => ({
    ...q,
    tags: typeof q.tags === 'string'
      ? q.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : (Array.isArray(q.tags) ? q.tags : [])
  }));
}

export async function fetchFigures(): Promise<Figure[]> {
  const data = await requestJson('/figures');
  return data.figures || [];
}
