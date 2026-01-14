import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const ordersFile = path.join(__dirname, "orders.json");

if (!fs.existsSync(ordersFile)) {
  fs.writeFileSync(ordersFile, "[]");
}

app.post("/order", (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ordersFile));
  orders.push({ ...req.body, date: new Date().toLocaleString() });
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.json({ success: true });
});

app.get("/admin/orders", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(ordersFile)));
});

app.listen(3000, () => {
  console.log("Ison 3D running on http://localhost:3000");
});
