import express from 'express';
import session from 'express-session';
import path from 'path';
import { createServer } from 'node:http';
import { createBareServer } from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { dynamicPath } from "@nebula-services/dynamic";

// Define routes for pages
const routes = [
  ["/", "index"],
  ["/math", "games"],
  ["/physics", "apps"],
  ["/settings", "settings"],
  ["/vizion", "vizion"], // Existing routes
  ["/admin", "admin"] // Admin route
];

// Define navigation items
const navItems = [
  ["/", "Home"],
  ["/math", "Games"],
  ["/physics", "Apps"],
  ["/settings", "Settings"],
  ["/vizion", "Vizion"], // Existing navigation items
  ["/admin", "Admin"] // Added Admin navigation item
];

const bare = createBareServer("/bare/");
const app = express();

// Track online IPs
const onlineIps = new Set();

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views')); // Ensure views directory is set

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uv/", express.static(uvPath));
app.use("/dynamic/", express.static(dynamicPath));

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

// Route handling for dynamic routes
for (const [routePath, page] of routes) {
  app.get(routePath, (_, res) =>
    res.render("layout", {
      path: routePath,
      navItems,
      page,
    })
  );
}

// Admin login page
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin_login.html')); // Ensure this file exists
});

// Admin login handler
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') { // Change these values for security
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.redirect('/admin/login?error=Invalid credentials');
  }
});

// Admin panel access
app.get('/admin', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, 'public', 'admin.html')); // Ensure this file exists
  } else {
    res.redirect('/admin/login');
  }
});

// Admin logout handler
app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// API endpoint to get online IPs
app.get('/api/online-ips', (req, res) => {
  res.json(Array.from(onlineIps));
});

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

// Start the server
ttpServer.listen(process.env.PORT || 8080, () => {
  const addr = httpServer.address();
  console.log(`\x1b[42m\x1b[1m emerald\n Port: ${addr.port}\x1b[0m`);
});
});
