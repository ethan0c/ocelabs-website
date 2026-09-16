import 'server-only';
import { createHash } from 'node:crypto';

/*
 * The PIN never reaches the browser. It is checked in a server action, which
 * sets an HttpOnly cookie holding a hash of the PIN and a secret. The page
 * is a server component that renders the estimator only when that cookie
 * verifies, so nothing behind the gate appears in the HTML beforehand.
 *
 * Set PRICING_PIN and PRICING_SECRET in the environment to change either
 * without touching code. Changing the secret signs everyone out.
 */
export const COOKIE = 'pricing_ok';
export const PIN = process.env.PRICING_PIN ?? '2305';
const SECRET = process.env.PRICING_SECRET ?? 'ocelabs-pricing-v1';

export function token() {
  return createHash('sha256').update(`${PIN}:${SECRET}`).digest('hex');
}

export function isValid(value: string | undefined) {
  return Boolean(value) && value === token();
}
