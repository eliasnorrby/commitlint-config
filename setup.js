#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const yargs = require("yargs");
const hasYarn = require("has-yarn")();

const pkgInstall = hasYarn ? "yarn add" : "npm install";
const pkgInstallDev = `${pkgInstall} -D`;

yargs
  .alias("v", "version")
  .usage("Usage: $0 [options]")
  .help("h")
  .alias("h", "help")
  .option("i", {
    describe: "Install this package",
    type: "boolean",
    alias: "install",
    default: true,
  })
  .describe("no-install", "Skip installing this package")
  .strict(true);

const argv = yargs.argv;

// Set up logging methods
const log = {
  info: msg =>
    console.log(`${chalk.bgGreen.black(" INFO ")} ${chalk.green(msg)}`),
  warn: msg =>
    console.log(`${chalk.bgYellow.black(" WARN ")} ${chalk.yellow(msg)}`),
  skip: msg => console.log(`${chalk.bgGray(" SKIP ")} ${msg}`),
  error: msg =>
    console.log(`${chalk.bgRed.black(" ERROR ")} ${chalk.red(msg)}`),
};

const packageName = "@eliasnorrby/commitlint-config";

if (!fs.existsSync("package.json")) {
  log.error(
    "No package.json found in the current directory. Make sure you are in the project root. If no package.json exists yet, run `npm init` first.",
  );
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const husky = packageJson.husky;

const hooksDefined = Boolean(husky && husky.hooks);
const msghookDefined = Boolean(hooksDefined && husky.hooks["commit-msg"]);

if (msghookDefined) {
  log.skip(`commit-msg hook already configured: ${husky.hooks["commit-msg"]}`);
} else {
  const newHusky = {
    hooks: {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
    },
  };
  if (husky && hooksDefined) {
    newHusky.hooks = { ...husky.hooks, ...newHusky.hooks };
  }
  packageJson.husky = newHusky;
  log.info("Added commitlint to git hook");
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  log.info("package.json saved");
}

const config = argv.install
  ? `\
module.exports = {
  extends: ["@eliasnorrby/commitlint-config"],
  // Override rules here
};
`
  : `\
module.exports = {
  extends: ["@commitlint/config-conventional"],
  // Add rules here
}
`;

if (!fs.existsSync("commitlint.config.js"))
  fs.writeFileSync("commitlint.config.js", config, "utf8");

const gitmessage = fs.readFileSync(
  path.resolve(__dirname, ".gitmessage"),
  "utf8",
);

fs.writeFileSync(".gitmessage", gitmessage, "utf8");

log.info("Setting local git commit message template");
require("child_process").execSync("git config commit.template .gitmessage", {
  stdio: "inherit",
});

log.info("Installing peer dependencies (@commitlint/cli, husky)");
require("child_process").execSync(`${pkgInstallDev} @commitlint/cli husky`, {
  stdio: "inherit",
});

if (argv.install) {
  log.info(`Installing self (${packageName})`);
  require("child_process").execSync(`${pkgInstallDev} ${packageName}`, {
    stdio: "inherit",
  });
} else {
  log.skip("Skipping install of self");
  const baseConfig = "@commitlint/config-conventional";
  log.info(`Installing conventional config (${baseConfig})`);
  require("child_process").execSync(`${pkgInstallDev} ${baseConfig}`, {
    stdio: "inherit",
  });
}

log.info("Done!");
