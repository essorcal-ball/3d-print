import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const files = {
  accounts: "accounts.json",
  orders: "orders.json",
  notifications: "notifications.json"
};

for (const f of Object.values(files)) {
  if (!fs.existsSync(f)) fs.writeFileSync(f, "[]");
}

const read = f => JSON.parse(fs.readFileSync(f));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

/* ACCOUNTS */
app.post("/register", (req, res) => {
  const { username, password, realName } = req.body;
  const accounts = read(files.accounts);

  if (accounts.find(a => a.username === username)) {
    return res.json({ error: "Username exists" });
  }

  accounts.push({
    username,
    password,
    realName,
    premium: false
  });

  write(files.accounts, accounts);
  res.json({ success: true });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const account = read(files.accounts)
    .find(a => a.username === username && a.password === password);

  if (!account) return res.json({ error: "Invalid login" });
  res.json(account);
});

/* ORDERS */
app.post("/order", (req, res) => {
  const orders = read(files.orders);
  orders.push({ ...req.body, date: new Date().toLocaleString() });
  write(files.orders, orders);
  res.json({ success: true });
});

/* ADMIN */
app.get("/admin/orders", (req, res) => {
  res.json(read(files.orders));
});

app.get("/admin/accounts", (req, res) => {
  res.json(read(files.accounts));
});

app.post("/admin/premium", (req, res) => {
  const accounts = read(files.accounts);
  const acc = accounts.find(a => a.username === req.body.username);
  if (acc) acc.premium = req.body.premium;
  write(files.accounts, accounts);
  res.json({ success: true });
});

app.post("/admin/notify", (req, res) => {
  const notes = read(files.notifications);
  notes.push(req.body);
  write(files.notifications, notes);
  res.json({ success: true });
});

app.get("/notifications/:user", (req, res) => {
  res.json(read(files.notifications).filter(n => n.user === req.params.user));
});

app.listen(3000, () => {
  console.log("Ison 3D running");
});
