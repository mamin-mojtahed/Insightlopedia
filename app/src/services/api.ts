import { Figure, Quote } from '../types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export async function fetchQuotes(tag?: string | null): Promise<Quote[]> {
  const url = tag ? `${API_BASE}/quotes?tag=${encodeURIComponent(tag)}` : `${API_BASE}/quotes`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch quotes: ${response.statusText}`);
  }
  const data = await response.json();
  return data.quotes.map((q: any) => ({
    ...q,
    tags: typeof q.tags === 'string'
      ? q.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : (Array.isArray(q.tags) ? q.tags : [])
  }));
}

export async function fetchFigures(): Promise<Figure[]> {
  const response = await fetch(`${API_BASE}/figures`);
  if (!response.ok) {
    throw new Error(`Failed to fetch figures: ${response.statusText}`);
  }
  const data = await response.json();
  return data.figures || [];
}

