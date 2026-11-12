import { SITE } from '@/lib/site';

// Private areas stay out of every index; everything else is open to search engines and AI assistants.
// (/checkout, /booth and /event are NOT blocked here on purpose: they carry a noindex tag,
//  and crawlers have to be allowed to fetch a page to see that tag.)
const PRIVATE = ['/admin', '/api/'];

// AI crawlers named explicitly so the site can be cited in ChatGPT, Claude, Perplexity, Gemini, Copilot etc.
const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot', 'Applebot-Extended',
  'Bingbot', 'CCBot', 'Meta-ExternalAgent', 'DuckAssistBot', 'MistralAI-User', 'cohere-ai'
];

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: '/', disallow: PRIVATE }
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url
  };
}
