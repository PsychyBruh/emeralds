import express from 'express';
import session from 'express-session';
import path from 'path';
import fs from 'fs';

const app = express();

// Track online IPs
const onlineIps = new Set();

app.use(express.json()); // To parse JSON data
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory

// Session management setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Use environment variable for better security
  resave: false,
  saveUninitialized: true,
}));

// Middleware to manage online IPs
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip) {
    onlineIps.add(ip);
  }
  req.on('end', () => {
    onlineIps.delete(ip);
  });
  next();
});

// Middleware to protect admin routes
const isAuthenticated = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

// Admin login page
app.get('/admin/login', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin_login.html'));
});

// Admin login handler
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'psychy' && password === 'N!ght123@') { // Change these values
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.redirect('/admin/login?error=Invalid credentials');
  }
});

// Admin panel access
app.get('/admin', isAuthenticated, (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API endpoint to get online IPs
app.get('/api/online-ips', (req, res) => {
  res.json(Array.from(onlineIps));
});

// Other routes and logic...

// Create and configure HTTP server
const httpServer = createServer((req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

// Existing server setup code...
