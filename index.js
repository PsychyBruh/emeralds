import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'node:http';
import { createBareServer } from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { dynamicPath } from "@nebula-services/dynamic";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Track online IPs
const onlineIps = new Set();

app.set("view engine", "ejs");
app.set("views", join(__dirname, 'views')); // Ensure views directory is set

app.use(express.static(join(__dirname, 'public'))); // Serve static files from 'public' directory
app.use("/uv/", express.static(uvPath));
app.use("/dynamic/", express.static(dynamicPath));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Session management setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Admin login route
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  // Basic authentication check (replace with your own logic)
  if (username === 'admin' && password === 'password') { // Replace with secure authentication
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.sendFile(join(__dirname, 'public', 'admin_login.html')); // Render admin_login.html
  }
});

// Admin login page
app.get('/admin/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/admin');
  } else {
    res.sendFile(join(__dirname, 'public', 'admin_login.html')); // Serve admin_login.html
  }
});

// Admin dashboard
app.get('/admin', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(join(__dirname, 'public', 'admin.html')); // Serve admin.html
  } else {
    res.redirect('/admin/login');
  }
});

// API to get online IPs
app.get('/api/online-ips', (req, res) => {
  res.json(Array.from(onlineIps));
});

// Define routes
const routes = [
  ["/", "index"],
  ["/math", "games"],
  ["/physics", "apps"],
  ["/settings", "settings"],
  ["/vizion", "vizion"], // New route added here
  ["/admin", "admin"], // Admin route
];

const navItems = [
  ["/", "Home"],
  ["/math", "Games"],
  ["/physics", "Apps"],
  ["/settings", "Settings"],
  ["/vizion", "Vizion"], // New navigation item
  ["/admin", "Admin"], // Admin navigation item
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
