const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(".")); // serve index.html and images

const DATA_FILE = "./data.json";

// Load or initialize data
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: {}, orders: [], notifications: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
}
function saveData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

// Products
const products = {
  "Spiral Fidget": { Small: 2, Medium: 3.5, Large: 5 },
  "Articulated Octopus": { Small: 2.5, Medium: 4, Large: 6 },
  "Infinity Cube": { Small: 2, Medium: 3.5, Large: 5 },
  "Invertible Star": { Small: 2, Medium: 4, Large: 6 },
  "Articulated Snake": { Small: 4, Medium: 7, Large: 10 }
};

// ---------- API ----------

// Get products
app.get("/api/products", (req, res) => res.json(products));

// Signup
app.post("/api/signup", (req, res) => {
  const { username, password, realName, email } = req.body;
  if (!username || !password || !realName) return res.status(400).send("Missing fields");
  let data = loadData();
  if (data.users[username]) return res.status(400).send("User exists");
  data.users[username] = { password, realName, email, premium: false };
  saveData(data);
  res.send("Account created");
});

// Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const data = loadData();
  const u = data.users[username];
  if (!u || u.password !== password) return res.status(401).send("Login failed");
  res.json({ username, realName: u.realName, premium: u.premium });
});

// Place order
app.post("/api/order", (req, res) => {
  const { username, product, size, color, qty, premiumUpgrade, special } = req.body;
  const data = loadData();
  const u = data.users[username];
  if (!u) return res.status(400).send("Invalid user");
  if (!u.premium && (premiumUpgrade !== "none" || special)) return res.status(403).send("Premium required");
  data.orders.push({ username, realName: u.realName, product, size, color, qty, premiumUpgrade, special, time: new Date().toISOString() });
  saveData(data);
  res.send("Order placed");
});

// Premium request
app.post("/api/premium-request", (req, res) => {
  const { username } = req.body;
  const data = loadData();
  const u = data.users[username];
  if (!u) return res.status(400).send("Invalid user");
  data.orders.push({ username, realName: u.realName, product: "Premium Account", premiumRequest: true, time: new Date().toISOString() });
  saveData(data);
  res.send("Premium request sent to admin");
});

// Get all users (admin)
app.get("/api/users", (req, res) => res.json(loadData().users));

// Get all orders (admin)
app.get("/api/orders", (req, res) => res.json(loadData().orders));

// Toggle premium (admin)
app.post("/api/admin/toggle-premium", (req, res) => {
  const { username } = req.body;
  const data = loadData();
  if (!data.users[username]) return res.status(400).send("No such user");
  data.users[username].premium = !data.users[username].premium;
  saveData(data);
  res.send("Premium toggled");
});

// Delete account (admin)
app.post("/api/admin/delete-account", (req, res) => {
  const { username } = req.body;
  const data = loadData();
  delete data.users[username];
  saveData(data);
  res.send("Account deleted");
});

// Notifications
app.post("/api/notify", (req, res) => {
  const { username, message } = req.body;
  const data = loadData();
  data.notifications.push({ username, message, time: new Date().toISOString() });
  saveData(data);
  res.send("Notification sent");
});

app.get("/api/notifications/:username", (req, res) => {
  const data = loadData();
  res.json(data.notifications.filter(n => n.username === req.params.username));
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
