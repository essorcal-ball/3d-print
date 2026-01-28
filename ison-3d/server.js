import express from "express"
import session from "express-session"
import nodemailer from "nodemailer"
import path from "path"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 10000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  session({
    secret: "ison3d-secret",
    resave: false,
    saveUninitialized: true
  })
)

// Serve frontend
app.use(express.static(path.join(process.cwd(), "public")))

// EMAIL TRANSPORT
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.BUSINESS_EMAIL,
    pass: process.env.BUSINESS_EMAIL_PASSWORD
  }
})

// ---------------- ROUTES ----------------

app.post("/register", async (req, res) => {
  const { realname, address, username, password } = req.body

  if (!realname || !address || !username || !password) {
    return res.json({ success: false, message: "All fields required" })
  }

  req.session.user = { realname, address, username }

  await transporter.sendMail({
    from: `"Ison 3D Website" <${process.env.BUSINESS_EMAIL}>`,
    to: process.env.BUSINESS_EMAIL,
    subject: "🆕 New Account Created",
    text: `
NEW ACCOUNT

Name: ${realname}
Address: ${address}
Username: ${username}
`
  })

  res.json({ success: true, name: realname, address })
})

app.post("/login", (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.json({ success: false, message: "Missing login info" })
  }

  req.session.user = { username }

  res.json({ success: true })
})

app.post("/order", async (req, res) => {
  const { user, item, details } = req.body

  if (!user || !item) {
    return res.json({ success: false })
  }

  await transporter.sendMail({
    from: `"Ison 3D Orders" <${process.env.BUSINESS_EMAIL}>`,
    to: process.env.BUSINESS_EMAIL,
    subject: "🖨️ New Order Received",
    text: `
NEW ORDER

Name: ${user.name}
Address: ${user.address}
Username: ${user.username}

Item: ${item}
Details: ${details}
`
  })

  res.json({ success: true })
})

app.post("/update-profile", async (req, res) => {
  const { username, name, address } = req.body

  await transporter.sendMail({
    from: `"Ison 3D Profile Update" <${process.env.BUSINESS_EMAIL}>`,
    to: process.env.BUSINESS_EMAIL,
    subject: "✏️ Profile Updated",
    text: `
PROFILE UPDATE

Username: ${username}
New Name: ${name}
New Address: ${address}
`
  })

  res.json({ success: true })
})

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log("Ison 3D running on port " + PORT)
})
