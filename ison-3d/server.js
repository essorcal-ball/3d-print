import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* CREATE TABLES IF NOT EXISTS */
await pool.query(`
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  real_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  premium BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  username TEXT,
  item TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  username TEXT,
  message TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);

/* ACCOUNTS */
app.post("/register", async (req, res) => {
  const { realName, username, password } = req.body;
  try {
    await pool.query(
      "INSERT INTO accounts (real_name, username, password) VALUES ($1,$2,$3)",
      [realName, username, password]
    );
    res.json({ success: true });
  } catch {
    res.json({ error: "Username already exists" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const r = await pool.query(
    "SELECT real_name, username, premium FROM accounts WHERE username=$1 AND password=$2",
    [username, password]
  );
  r.rows.length ? res.json(r.rows[0]) : res.json({ error: "Invalid login" });
});

/* ORDERS */
app.post("/order", async (req, res) => {
  await pool.query(
    "INSERT INTO orders (username, item) VALUES ($1,$2)",
    [req.body.user, req.body.item]
  );
  res.json({ success: true });
});

/* ADMIN */
app.get("/admin/orders", async (req, res) => {
  const r = await pool.query("SELECT * FROM orders ORDER BY date DESC");
  res.json(r.rows);
});

app.get("/admin/accounts", async (req, res) => {
  const r = await pool.query("SELECT username, real_name, premium FROM accounts");
  res.json(r.rows);
});

app.post("/admin/premium", async (req, res) => {
  await pool.query(
    "UPDATE accounts SET premium=$1 WHERE username=$2",
    [req.body.premium, req.body.username]
  );
  res.json({ success: true });
});

/* NOTIFICATIONS */
app.post("/admin/notify", async (req, res) => {
  await pool.query(
    "INSERT INTO notifications (username, message) VALUES ($1,$2)",
    [req.body.user, req.body.message]
  );
  res.json({ success: true });
});

app.get("/notifications/:user", async (req, res) => {
  const r = await pool.query(
    "SELECT message, date FROM notifications WHERE username=$1 ORDER BY date DESC",
    [req.params.user]
  );
  res.json(r.rows);
});

app.listen(3000, () => console.log("Ison 3D running with PostgreSQL"));
