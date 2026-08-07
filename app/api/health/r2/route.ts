import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/health/r2
 * Safe health check — never leaks secret values.
 * Use to verify Vercel env and R2 connectivity without exposing creds.
 */
export async function GET() {
  const hasAccountId = !!process.env.R2_ACCOUNT_ID;
  const hasAccessKeyId = !!process.env.R2_ACCESS_KEY_ID;
  const hasSecretAccessKey = !!process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || "satoh-website (default)";
  const nodeVersion = process.version;
  const configured = hasAccountId && hasAccessKeyId && hasSecretAccessKey;

  let r2Check: { ok: boolean; error?: string; itemCount?: number } | null = null;

  if (configured) {
    try {
      const { readStockJson } = await import("@/lib/r2Json");
      const data = await readStockJson();
      r2Check = { ok: true, itemCount: data.items.length };
    } catch (e) {
      const msg = String(e);
      // Truncate to avoid leaking paths/creds
      r2Check = { ok: false, error: msg.slice(0, 500) };
    }
  } else {
    r2Check = {
      ok: false,
      error: "Missing R2 env vars. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in Vercel (Production).",
    };
  }

  return NextResponse.json({
    env: {
      hasAccountId,
      hasAccessKeyId,
      hasSecretAccessKey,
      bucket,
      configured,
    },
    runtime: {
      nodeVersion,
      vercel: !!process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV || null,
    },
    r2: r2Check,
  });
}
