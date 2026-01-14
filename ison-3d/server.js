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
  const { realName, username, password } = req.body;
  const accounts = read(files.accounts);

  if (!realName) return res.json({ error: "Real name required" });
  if (accounts.find(a => a.username === username))
    return res.json({ error: "Username exists" });

  accounts.push({ realName, username, password, premium: false });
  write(files.accounts, accounts);
  res.json({ success: true });
});

app.post("/login", (req, res) => {
  const acc = read(files.accounts)
    .find(a => a.username === req.body.username && a.password === req.body.password);
  if (!acc) return res.json({ error: "Invalid login" });
  res.json(acc);
});

app.post("/delete-account", (req, res) => {
  write(files.accounts, read(files.accounts)
    .filter(a => a.username !== req.body.username));
  res.json({ success: true });
});

/* ORDERS */
app.post("/order", (req, res) => {
  const orders = read(files.orders);
  orders.push({ ...req.body, date: new Date().toLocaleString() });
  write(files.orders, orders);
  res.json({ success: true });
});

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

app.listen(3000, () => console.log("Ison 3D running"));
