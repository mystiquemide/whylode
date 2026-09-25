// Public base URL for links (expert links, Open Graph). Prefers WHYLODE_BASE_URL,
// then Vercel's production domain, then localhost for local development.
export function baseUrl(): string {
  if (process.env.WHYLODE_BASE_URL) return process.env.WHYLODE_BASE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'http://localhost:3000';
}
