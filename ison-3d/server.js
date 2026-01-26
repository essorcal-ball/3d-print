import express from "express";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// EMAIL SETUP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ORDER_EMAIL,
    pass: process.env.ORDER_EMAIL_PASSWORD
  }
});

// ORDER ENDPOINT
app.post("/order", async (req, res) => {
  try {
    const order = req.body;

    const emailHTML = `
      <h2>🧾 New Order - Ison 3D</h2>
      <p><strong>Name:</strong> ${order.name}</p>
      <p><strong>Username:</strong> ${order.username}</p>
      <p><strong>Item:</strong> ${order.item}</p>
      <p><strong>Size:</strong> ${order.size}</p>
      <p><strong>Color:</strong> ${order.color}</p>
      <p><strong>Quantity:</strong> ${order.quantity}</p>
      <p><strong>Premium:</strong> ${order.premium}</p>
      <p><strong>Special Request:</strong> ${order.special || "None"}</p>
      <p><strong>Total Cost:</strong> $${order.total}</p>
    `;

    await transporter.sendMail({
      from: `"Ison 3D Orders" <${process.env.ORDER_EMAIL}>`,
      to: process.env.ORDER_EMAIL,
      subject: "New Ison 3D Order",
      html: emailHTML
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
