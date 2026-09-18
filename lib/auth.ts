import "server-only";
import { cookies } from "next/headers";
import { query } from "./db";
import { digest, HttpError } from "./security";
export const COOKIE = "pythonblock_session";
export type User = { id: string; username: string; name: string; role: "teacher" | "student"; class_id: number; avatar: string; score: string; reduce_motion: boolean };
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const result = await query(`SELECT u.id,u.username,u.name,u.role,u.class_id,u.avatar,u.score,u.reduce_motion FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.active=true`, [digest(token)]);
  return result.rows[0] || null;
}
export async function requireUser() { const user = await currentUser(); if (!user) throw new HttpError(401, "Entre novamente para continuar."); return user; }
export async function requireTeacher() { const user = await requireUser(); if (user.role !== "teacher") throw new HttpError(403, "Esta ação é exclusiva do professor."); return user; }
