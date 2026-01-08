const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
// 1. THE AUTONOMOUS ROUTER
// Every folder in /projects becomes a URL: k-deploy.com/project-name
const projectsDir = path.join(__dirname, 'projects');
if (!fs.existsSync(projectsDir)) fs.mkdirSync(projectsDir);
const updateRoutes = () => {
const folders = fs.readdirSync(projectsDir);
folders.forEach(project => {
app.use(`/${project}`, express.static(path.join(projectsDir, project)));
console.log(`📡 Infrastructure: Routing /${project} to live storage.`);
});
};
updateRoutes();
// 2. THE WEBHOOK (The "Invisible GitHub" Bridge)
// You set this URL in GitHub Webhooks. MERK pushes -> GitHub pings this -> K-Deploy updates.
app.post('/deploy-webhook', (req, res) => {
console.log("🚀 K-Deploy: Deployment Signal Received...");
// Commands to sync the entire Kodeblock Vault
exec('git pull origin main', (err) => {
if (err) return res.status(500).send("Sync Error");
// Refresh the routes so new projects appear instantly
updateRoutes();
console.log("✅ K-Deploy: Infrastructure Sync Complete.");
res.status(200).send("Deployed");
});
});
// 3. THE MANAGEMENT API (For MERK to talk to)
app.get('/api/status', (req, res) => {
const projects = fs.readdirSync(projectsDir);
res.json({
status: "Online",
engine: "K-Deploy v1.0",
active_projects: projects,
uptime: process.uptime()
});
});
app.get('/', (req, res) => res.send('<h1>K-DEPLOY INFRASTRUCTURE: ONLINE</h1>'));
app.listen(PORT, () => console.log(`K-Deploy Engine active on port ${PORT}`));