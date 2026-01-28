import express from "express"
import nodemailer from "nodemailer"
import path from "path"
import { fileURLToPath } from "url"

const app = express()
const PORT = process.env.PORT || 10000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

const ADMIN_USER = process.env.ADMIN_USER
const ADMIN_PASS = process.env.ADMIN_PASS

// LOGIN ROUTE
app.post("/login", (req, res) => {
  const { username, password } = req.body

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true })
  } else {
    res.json({ success: false, message: "Invalid login" })
  }
})

// EMAIL TRANSPORT
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ORDER_EMAIL,
    pass: process.env.ORDER_EMAIL_PASSWORD
  }
})

// ORDER ROUTE
app.post("/order", async (req, res) => {
  const orderText = `
NEW ORDER RECEIVED

Name: ${req.body.name}
Email: ${req.body.email}
Item: ${req.body.item}
Color(s): ${req.body.colors}
Quantity: ${req.body.quantity}
Notes: ${req.body.notes}
`

  try {
    await transporter.sendMail({
      from: process.env.ORDER_EMAIL,
      to: process.env.ORDER_EMAIL,
      subject: "New Ison 3D Order",
      text: orderText
    })

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.json({ success: false })
  }
})

app.listen(PORT, () => {
  console.log("Server running on port", PORT)
})
