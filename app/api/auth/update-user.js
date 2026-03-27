import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const { id, name, username, password } = await req.json();
    if (!username) {
      return new Response(JSON.stringify({ error: 'Missing username' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const usersPath = path.join(process.cwd(), 'app', 'api', 'auth', 'users.json');
    const usersRaw = await fs.readFile(usersPath, 'utf-8');
    const users = JSON.parse(usersRaw);
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) {
      console.error('User not found for id:', id);
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    // Check for username conflict
    if (username && users.some((u, i) => u.username === username && i !== idx)) {
      console.error('Username conflict for username:', username);
      return new Response(JSON.stringify({ error: 'Username already taken' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    if (name) users[idx].name = name;
    if (username) users[idx].username = username;
    if (password) users[idx].password = password;
    try {
      await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
    } catch (writeErr) {
      console.error('File write error:', writeErr);
      return new Response(JSON.stringify({ error: 'File write error', details: writeErr.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ success: true, user: users[idx] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('API error:', e);
    // Always return JSON, even for unexpected errors
    return new Response(JSON.stringify({ error: 'Server error', details: e && e.message ? e.message : String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
