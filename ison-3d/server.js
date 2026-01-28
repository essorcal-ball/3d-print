import express from "express";
});


// CREATE ACCOUNT
app.post("/api/register", (req, res) => {
const { name, address, username, password } = req.body;


const exists = users.find(u => u.username === username);
if (exists) return res.status(400).json({ error: "Username already exists" });


const user = { name, address, username, password };
users.push(user);


req.session.user = user;
res.json({ success: true });
});


// LOGIN
app.post("/api/login", (req, res) => {
const { username, password } = req.body;


const user = users.find(u => u.username === username && u.password === password);
if (!user) return res.status(401).json({ error: "Invalid login" });


req.session.user = user;
res.json({ success: true, name: user.name });
});


// LOGOUT
app.post("/api/logout", (req, res) => {
req.session.destroy();
res.json({ success: true });
});


// ORDER EMAIL
app.post("/api/order", async (req, res) => {
if (!req.session.user) return res.status(403).json({ error: "Not logged in" });


const { model, color, notes } = req.body;
const user = req.session.user;


const mailOptions = {
from: process.env.EMAIL_USER,
to: process.env.ORDER_EMAIL,
subject: "New Ison 3D Order",
text: `
NEW ORDER


Name: ${user.name}
Address: ${user.address}
Username: ${user.username}


Model: ${model}
Color: ${color}
Notes: ${notes}
`
};


await transporter.sendMail(mailOptions);
res.json({ success: true });
});


app.listen(10000, () => {
console.log("Ison 3D running on port 10000");
});
