import "server-only";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.STOCK_APP_JWT_SECRET || "dev-secret-change-me-in-production"
);

const SHARED_PASSWORD = process.env.STOCK_APP_PASSWORD || "satoh-stock-2024";

const COOKIE_NAME = "stock-app-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_DURATION = SESSION_MAX_AGE;

export async function createSessionToken(operatorName: string): Promise<string> {
  return new SignJWT({ operator: operatorName })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<{ operator: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { operator: payload.operator as string };
  } catch {
    return null;
  }
}

export function verifyPassword(password: string): boolean {
  return password === SHARED_PASSWORD;
}

/**
 * Middleware-style helper to check auth from a Request
 * Returns the operator name if authenticated, or null.
 */
export async function checkAuth(
  cookieValue: string | undefined
): Promise<string | null> {
  if (!cookieValue) return null;
  const session = await verifySessionToken(cookieValue);
  return session?.operator ?? null;
}