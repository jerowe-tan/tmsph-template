import type { INestApplication } from '@nestjs/common';

// Host-level crawl policy for this service. Only this host can speak for
// itself: the frontend's robots.txt has no authority over api.* paths.
// Minimal structural typing keeps this adapter-agnostic (Express + Fastify).

const ROBOTS_TXT = `User-agent: *
Disallow: /api/
Disallow: /reference

User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: CCBot
User-agent: anthropic-ai
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: PerplexityBot
User-agent: Bytespider
User-agent: Diffbot
Disallow: /
`;

interface RobotsMiddlewareResponse {
  setHeader(name: string, value: string): void;
  end(body: string): void;
}

export function configRobots(app: INestApplication): void {
  // Served from middleware so it answers before any guard runs.
  app.use('/robots.txt', (_req: unknown, res: RobotsMiddlewareResponse) => {
    res.setHeader('Content-Type', 'text/plain');
    res.end(ROBOTS_TXT);
  });
}
