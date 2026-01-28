function showRegister() {
document.getElementById("loginBox").classList.remove("hidden");
}


async function register() {
const name = regName.value;
const address = regAddress.value;
const username = regUser.value;
const password = regPass.value;


const res = await fetch("/api/register", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ name, address, username, password })
});


if (res.ok) {
window.location = "/order.html";
} else {
alert("Username already exists");
}
}


async function login() {
const username = loginUser.value;
const password = loginPass.value;


const res = await fetch("/api/login", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username, password })
});


if (res.ok) {
window.location = "/order.html";
} else {
alert("Invalid login");
}
}


async function logout() {
await fetch("/api/logout", { method: "POST" });
window.location = "/";
}


async function order() {
const model = document.getElementById("model").value;
const color = document.getElementById("color").value;
const notes = document.getElementById("notes").value;


const res = await fetch("/api/order", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ model, color, notes })
});


if (res.ok) {
alert("Order sent successfully!");
} else {
alert("You must be logged in");
}
}
