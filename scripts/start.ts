import { spawnSync } from "node:child_process";

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const port = process.env.PORT || "3000";

run("npm", ["run", "db:migrate"]);
run("npm", ["run", "bootstrap:admin"]);
run("npx", ["next", "start", "-H", "0.0.0.0", "-p", port]);
