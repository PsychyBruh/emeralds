import { createBareServer } from "@tomphttp/bare-server-node";
import { createServer } from "node:http";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { dynamicPath } from "@nebula-services/dynamic";
import express from "express";

const routes = [
  ["/", "index"],
  ["/math", "games"],
  ["/physics", "apps"],
  ["/settings", "settings"],
  ["/vizion", "vizion"], // Route for vizion.ejs
];

const navItems = [
  ["/", "Home"],
  ["/math", "Games"],
  ["/physics", "Apps"],
  ["/settings", "Settings"],
  ["/vizion", "Vizion"], // Nav item for vizion.ejs
];

const bare = createBareServer("/bare/");
const app = express();

app.set("view engine", "ejs");
app.set("views", "./views"); // Ensure this matches your views directory

app.use(express.static("./public"));
app.use("/uv/", express.static(uvPath));
app.use("/dynamic/", express.static(dynamicPath));

// Define routes
for (const [path, page] of routes) {
  app.get(path, (_, res) =>
    res.render(page, {
      path,
      navItems,
    })
  );
}

// Handle 404 errors
app.use((_, res) => res.status(404).render("404"));

const httpServer = createServer();

httpServer.on("request", (req, res) => {
  if (bare.shouldRoute(req)) bare.routeRequest(req, res);
  else app(req, res);
});

httpServer.on("error", (err) => console.log(err));
httpServer.on("upgrade", (req, socket, head) => {
  if (bare.shouldRoute(req)) bare.routeUpgrade(req, socket, head);
  else socket.end();
});

httpServer.listen({ port: process.env.PORT || 8080 }, () => {
  const addr = httpServer.address();
  console.log(`\x1b[42m\x1b[1m emerald\n Port: ${addr.port}\x1b[0m`);
});
