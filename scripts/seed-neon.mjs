import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
  `;

  await sql`
    INSERT INTO users (id, name, username, password, role) VALUES
      ('u1', 'Demo User', 'demo', 'demo', 'user'),
      ('u2', 'Admin User', 'admin', 'admin', 'admin')
    ON CONFLICT (id) DO NOTHING
  `;

  const rows = await sql`
    SELECT id, name, username, role
    FROM users
    ORDER BY username
  `;

  console.log("Seed complete. Users:", rows);
}

main().catch((err) => {
  console.error("Seed failed", err);
  process.exit(1);
});
