import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { dynamicPath } from '@nebula-services/dynamic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const onlineIps = new Set(); // Sample data
const bannedIps = new Set(); // Sample data

// Create Bare Server instance
const bare = createBareServer("/bare/");

app.set("view engine", "ejs");
app.set("views", join(__dirname, 'views'));

app.use(express.static(join(__dirname, 'public')));
app.use("/uv/", express.static(uvPath));
app.use("/dynamic/", express.static(dynamicPath));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'Mike#123@yes!ok',
  resave: false,
  saveUninitialized: true,
}));

// Admin login route
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'psychy' && password === 'N!ght123@') {
    req.session.loggedIn = true;
    res.redirect('/admin/home');
  } else {
    res.sendFile(join(__dirname, 'public', 'admin_login.html'));
  }
});

// Admin login page
app.get('/admin/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/admin/home');
  } else {
    res.sendFile(join(__dirname, 'public', 'admin_login.html'));
  }
});

// Admin pages
app.get('/admin/home', (req, res) => {
  if (req.session.loggedIn) {
    res.render('admin', { loggedIn: req.session.loggedIn });
  } else {
    res.redirect('/admin/login');
  }
});

app.get('/admin/ban-ip', (req, res) => {
  if (req.session.loggedIn) {
    res.render('ban-ip', { onlineIps: Array.from(onlineIps), loggedIn: req.session.loggedIn });
  } else {
    res.redirect('/admin/login');
  }
});

app.get('/admin/unban-ip', (req, res) => {
  if (req.session.loggedIn) {
    res.render('unban-ip', { bannedIps: Array.from(bannedIps), loggedIn: req.session.loggedIn });
  } else {
    res.redirect('/admin/login');
  }
});

app.post('/admin/ban-ip', (req, res) => {
  const { ip } = req.body;
  bannedIps.add(ip); // Add to banned list
  res.redirect('/admin/ban-ip');
});

app.post('/admin/unban-ip', (req, res) => {
  const { ip } = req.body;
  bannedIps.delete(ip); // Remove from banned list
  res.redirect('/admin/unban-ip');
});

// Define other routes
const routes = [
  ["/", "index"],
  ["/math", "games"],
  ["/physics", "apps"],
  ["/settings", "settings"],
  ["/vizion", "vizion"],
  ["/admin", "admin"]
];

const navItems = [
  ["/", "Home"],
  ["/math", "Games"],
  ["/physics", "Apps"],
  ["/settings", "Settings"],
  ["/vizion", "Vizion"],
  ["/admin", "Admin"]
];

for (const [path, page] of routes) {
  app.get(path, (req, res) => {
    res.render("layout", {
      path,
      navItems,
      page,
      loggedIn: req.session.loggedIn || false
    });
  });
}

// Handle 404 errors
app.use((_, res) => res.status(404).render("404"));

// Create and configure HTTP server
const httpServer = createServer((req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

httpServer.on("error", (err) => console.error("Server error:", err));
httpServer.on("upgrade", (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

// Start server
httpServer.listen(process.env.PORT || 8080, () => {
  const addr = httpServer.address();
  console.log(`\x1b[42m\x1b[1m emerald\n Port: ${addr.port}\x1b[0m`);
});
