import { Request, Response, NextFunction } from 'express';

// Primary allowed IPs: User's public IP and local networks
const DEFAULT_ALLOWED_IPS = [
  '103.211.17.131', // User's public IP address
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1',
  'localhost',
];

/**
 * Extracts the true client IP address, accounting for proxies (Vercel, Render, Cloudflare)
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    // In multi-proxy setups, the first IP in the list is the actual client
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }

  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (typeof cfConnectingIp === 'string') {
    return cfConnectingIp.trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp.trim();
  }

  return (req.ip || req.socket.remoteAddress || '').trim();
}

/**
 * Checks if a given IP address is authorized
 */
export function isIpAllowed(rawIp: string): boolean {
  if (!rawIp) return false;

  // Strip IPv6-mapped IPv4 prefix (e.g., ::ffff:103.211.17.131 -> 103.211.17.131)
  const normalized = rawIp.replace(/^::ffff:/, '');

  const envIps = (process.env.ALLOWED_IPS || '')
    .split(',')
    .map(ip => ip.trim())
    .filter(Boolean);

  const allowedSet = new Set([...DEFAULT_ALLOWED_IPS, ...envIps]);

  if (allowedSet.has(rawIp) || allowedSet.has(normalized)) {
    return true;
  }

  // Allow local development and standard private ranges
  if (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized.startsWith('127.') ||
    normalized.startsWith('192.168.') ||
    normalized.startsWith('10.') ||
    normalized.startsWith('172.16.') ||
    normalized.startsWith('172.17.') ||
    normalized.startsWith('172.18.') ||
    normalized.startsWith('172.19.') ||
    normalized.startsWith('172.20.') ||
    normalized.startsWith('172.21.') ||
    normalized.startsWith('172.22.') ||
    normalized.startsWith('172.23.') ||
    normalized.startsWith('172.24.') ||
    normalized.startsWith('172.25.') ||
    normalized.startsWith('172.26.') ||
    normalized.startsWith('172.27.') ||
    normalized.startsWith('172.28.') ||
    normalized.startsWith('172.29.') ||
    normalized.startsWith('172.30.') ||
    normalized.startsWith('172.31.')
  ) {
    return true;
  }

  return false;
}

/**
 * IP Gatekeeper Middleware:
 * Allows public access to demo endpoints, health checks, and static assets.
 * Restricts live generation and quota-consuming APIs to authorized IPs.
 */
export function restrictToAllowedIps(req: Request, res: Response, next: NextFunction) {
  // 1. Always allow CORS preflights and health checks
  if (req.method === 'OPTIONS') return next();
  if (req.path === '/api/health' || req.originalUrl.includes('/api/health')) return next();

  // 2. Always allow public demo lesson queries (Photosynthesis demo content)
  if (req.path.startsWith('/api/demo') || req.originalUrl.includes('/api/demo')) {
    return next();
  }

  // 3. For live AI generation and quota-consuming routes, check client IP
  const clientIp = getClientIp(req);

  if (isIpAllowed(clientIp)) {
    return next();
  }

  console.warn(`[Security Gate] Blocked unauthorized client IP: ${clientIp} on ${req.method} ${req.originalUrl}`);

  return res.status(403).json({
    error: 'Access restricted: Live AI generation is restricted to authorized IP addresses to protect API quotas. Demo lessons and mock tests remain accessible.',
    clientIp,
  });
}
