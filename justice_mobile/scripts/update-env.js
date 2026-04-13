// scripts/update-env.js
const fs = require('fs');
const os = require('os');
const path = require('path');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // ✅ Priorité aux IP 10.x.x.x (réseau local)
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('10.')) {
          return iface.address;
        }
      }
    }
  }
  // Fallback : première IP trouvée
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIP();
const envPath = path.resolve(__dirname, '../.env');
const content = `# Auto-généré - Ne PAS commiter dans Git
EXPO_PUBLIC_LOCAL_IP=${ip}
EXPO_PUBLIC_API_URL=http://${ip}:4000/api
EXPO_PUBLIC_TIMEOUT=30000
APP_VERSION=2.2.0
`;

fs.writeFileSync(envPath, content);
console.log(`✅ .env mis à jour !`);
console.log(`📍 IP détectée : ${ip}`);
console.log(`🔗 API : http://${ip}:4000/api`);