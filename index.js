import express from 'express';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser'; // To parse form data

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Session management setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'Mike#123@yes!ok', // Use environment variable for better security
  resave: false,
  saveUninitialized: true,
}));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets'))); // Ensure correct path to assets

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Ensure views directory is set

// Mock data for online and banned IPs
const onlineIps = new Set();
const bannedIps = new Set();

// Middleware to add IP management data to the response locals
app.use((req, res, next) => {
  res.locals.onlineIps = Array.from(onlineIps);
  res.locals.bannedIps = Array.from(bannedIps);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/admin', (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect('/admin/login');
  } else {
    res.render('admin', { page: 'home' });
  }
});

app.get('/admin/home', (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect('/admin/login');
  } else {
    res.render('admin', { page: 'home' });
  }
});

app.get('/admin/ban-ip', (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect('/admin/login');
  } else {
    res.render('admin', { page: 'ban-ip' });
  }
});

app.get('/admin/unban-ip', (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect('/admin/login');
  } else {
    res.render('admin', { page: 'unban-ip' });
  }
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  // Dummy authentication check
  if (username === 'psychy' && password === 'N!ght123@') {
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.render('admin_login', { error: 'Invalid username or password' });
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

app.post('/admin/ban-ip/:ip', (req, res) => {
  const { ip } = req.params;
  if (onlineIps.has(ip)) {
    onlineIps.delete(ip);
    bannedIps.add(ip);
  }
  res.redirect('/admin/ban-ip');
});

app.post('/admin/unban-ip/:ip', (req, res) => {
  const { ip } = req.params;
  if (bannedIps.has(ip)) {
    bannedIps.delete(ip);
  }
  res.redirect('/admin/unban-ip');
});

// Error handling for unknown routes
app.use((req, res) => {
  res.status(404).render('404'); // Ensure you have a 404.ejs view
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
