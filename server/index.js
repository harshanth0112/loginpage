import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Mock user data (no database needed)
const USERS = [
  { email: "demo@nimbus.com", password: "Nimbus@123", name: "Demo User" },
];

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  const user = USERS.find(
    (u) => u.email === email.trim().toLowerCase() && u.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }
  res.json({
    message: "Login successful",
    token: "mock-token-" + Date.now(),
    user: { name: user.name, email: user.email },
  });
});

app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Full name, work email, and password are required." });
  }
  const cleanEmail = email.trim().toLowerCase();
  const existingUser = USERS.find((u) => u.email === cleanEmail);
  if (existingUser) {
    return res.status(409).json({ message: "An account with this email address already exists." });
  }
  const newUser = { name: name.trim(), email: cleanEmail, password };
  USERS.push(newUser);
  res.status(201).json({
    message: "Registration successful",
    token: "mock-token-" + Date.now(),
    user: { name: newUser.name, email: newUser.email },
  });
});

app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: "Work email is required." });
  }
  const cleanEmail = email.trim().toLowerCase();
  const user = USERS.find((u) => u.email === cleanEmail);
  if (!user) {
    return res.json({
      message: "If an account exists for this email, cryptographic reset instructions have been dispatched.",
    });
  }
  res.json({
    message: "If an account exists for this email, cryptographic reset instructions have been dispatched.",
    demoHint: "Password for this demo account: " + user.password,
  });
});

app.post("/api/oauth", (req, res) => {
  const { provider, name, email } = req.body || {};
  if (!provider) {
    return res.status(400).json({ message: "OAuth provider is required." });
  }

  // Generate or match user in-memory (no database required)
  const userEmail = (email || `${provider.toLowerCase()}@institutional.nimbus.com`).toLowerCase();
  const userName = name || (provider === "google" ? "Google Enterprise User" : "GitHub Developer");

  let user = USERS.find((u) => u.email === userEmail);
  if (!user) {
    user = { email: userEmail, name: userName, provider };
    USERS.push(user);
  }

  res.json({
    message: `${provider} authentication successful`,
    token: `oauth-${provider}-${Date.now()}`,
    user: { name: user.name, email: user.email, provider },
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

