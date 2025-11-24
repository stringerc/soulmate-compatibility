/**
 * Magic Links Store
 * In-memory store for magic links (in production, use Redis or database)
 */

export const magicLinks = new Map<string, { email: string; expiresAt: number }>();

