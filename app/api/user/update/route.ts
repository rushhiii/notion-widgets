import Database from 'better-sqlite3';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request', details: err && err.message ? err.message : String(err) }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const { id, name, username, password } = body;
    try {
      if (!username) {
        return NextResponse.json({ error: 'Missing username' }, { status: 400 });
      }
      const dbPath = path.join(process.cwd(), 'app', 'api', 'auth', 'users.db');
      const db = new Database(dbPath);
      console.log('USER UPDATE API: dbPath', dbPath);
      // Check for username conflict (except for current user)
      const conflict = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, id);
      if (conflict) {
        db.close();
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }
      // Update user (only update password if provided)
      if (password && password.trim() !== "") {
        db.prepare('UPDATE users SET name = ?, username = ?, password = ? WHERE id = ?').run(name, username, password, id);
      } else {
        db.prepare('UPDATE users SET name = ?, username = ? WHERE id = ?').run(name, username, id);
      }
      const user = db.prepare('SELECT id, name, username, role, password FROM users WHERE id = ?').get(id);
      console.log('USER UPDATE API: updated user', user);
      db.close();
      return NextResponse.json({ success: true, user }, { status: 200 });
    } catch (e: any) {
      return NextResponse.json({ error: 'Server error', details: e && e.message ? e.message : String(e) }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', details: e && e.message ? e.message : String(e) }, { status: 500 });
  }
};
export const dynamic = "force-dynamic";