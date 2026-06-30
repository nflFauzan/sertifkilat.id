const net = require("net");
const fs = require("fs");
const path = require("path");

const port = 3000;

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(true); // Port is occupied
      } else {
        resolve(false);
      }
    });
    server.once("listening", () => {
      server.close(() => resolve(false)); // Port is free
    });
    server.listen(port);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "dev";

  if (command === "start") {
    const nextDir = path.join(process.cwd(), ".next");
    if (!fs.existsSync(nextDir)) {
      console.error("\x1b[31m[Error] Production build not found in the '.next' directory.\x1b[0m");
      console.error("\x1b[33mPlease build the application first by running 'npm run build' before starting the production server.\x1b[0m");
      process.exit(1);
    }
  }

  const isOccupied = await checkPort(port);
  if (isOccupied) {
    console.error(`\x1b[31m[Error] Port ${port} is already in use by another process.\x1b[0m`);
    console.error(`\x1b[33mPlease free port ${port} or close the process using it before starting the application.\x1b[0m`);
    console.error(`\x1b[33m(Execution aborted to prevent Next.js from silently switching to another port.)\x1b[0m`);
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Unexpected error in check-port script:", err);
  process.exit(1);
});
