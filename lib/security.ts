import { randomBytes, createHash, createHmac, scrypt, timingSafeEqual } from "node:crypto";
import type { ScryptOptions } from "node:crypto";
const derive = (password: string, salt: string, length: number, options: ScryptOptions) => new Promise<Buffer>((resolve,reject) => scrypt(password,salt,length,options,(error,key) => error ? reject(error) : resolve(key)));
export function secret() { const value = process.env.AUTH_SECRET; if (!value || value.length < 32) throw new Error("AUTH_NOT_CONFIGURED"); return value; }
export function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
export function opaqueToken() { return randomBytes(32).toString("base64url"); }
export function normalizeUsername(value: string) { return value.trim().toLowerCase(); }
export async function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const peppered = createHmac("sha256", secret()).update(password).digest("hex");
  const hash = await derive(peppered, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }) as Buffer;
  return `scrypt:${salt}:${hash.toString("hex")}`;
}
export async function passwordMatches(password: string, stored: string) {
  const [, salt, encoded] = stored.split(":");
  if (!salt || !encoded || encoded.length !== 128) return false;
  const peppered = createHmac("sha256", secret()).update(password).digest("hex");
  const actual = await derive(peppered, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }) as Buffer;
  return timingSafeEqual(actual, Buffer.from(encoded, "hex"));
}
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export function requireOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.APP_ORIGIN || new URL(request.url).origin;
  if (!origin || origin !== expected) throw new HttpError(403, "Recarregue a página antes de continuar.");
}
export function safeFilename(name: string) { return /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,70}\.(py|csv|json|txt)$/.test(name) && !name.includes(".."); }
